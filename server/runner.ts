import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const LANGUAGES = ['java', 'python', 'typescript', 'go', 'rust', 'csharp'] as const
export type LanguageId = (typeof LANGUAGES)[number]

export interface RunRequest {
  language: LanguageId
  /** Learner code */
  code: string
  /** Read-only types/fixtures from the kata */
  given?: string
  /** Test body. If absent, the learner code runs as a program (playground). */
  tests?: string
}

export interface TestResult {
  name: string
  passed: boolean
  message?: string
}

export interface RunResponse {
  ok: boolean
  phase: 'unavailable' | 'compile' | 'runtime' | 'timeout' | 'done'
  stdout: string
  stderr: string
  tests: TestResult[]
  durationMs: number
}

export interface Step {
  cmd: string
  args: string[]
}

export interface Prepared {
  /** Optional build step. A non-zero exit is reported as a compile error. */
  compile?: Step
  run: Step
  /** File the learner code lives in, used to rewrite paths in compiler output. */
  mainFile: string
  /** Line count before the learner code inside mainFile, for line-number mapping. */
  userOffset: number
  env?: Record<string, string>
  timeoutMs?: number
}

export interface LangAdapter {
  id: LanguageId
  label: string
  /** How to check that the toolchain exists. */
  probe: Step
  /** Hint shown when the toolchain is missing. */
  install: string
  prepare(dir: string, req: RunRequest): Promise<Prepared>
}

const TIMEOUT_MS = 20_000
const MAX_OUTPUT = 64_000

interface ExecResult {
  code: number | null
  stdout: string
  stderr: string
  timedOut: boolean
}

function exec(step: Step, cwd: string, env: Record<string, string> = {}, timeoutMs = TIMEOUT_MS): Promise<ExecResult> {
  return new Promise((resolve) => {
    const proc = spawn(step.cmd, step.args, { cwd, env: { ...process.env, JAVA_TOOL_OPTIONS: '', ...env } })
    let stdout = ''
    let stderr = ''
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      proc.kill('SIGKILL')
    }, timeoutMs)
    proc.stdout.on('data', (d) => {
      if (stdout.length < MAX_OUTPUT) stdout += d
    })
    proc.stderr.on('data', (d) => {
      if (stderr.length < MAX_OUTPUT) stderr += d
    })
    proc.on('error', (err) => {
      clearTimeout(timer)
      resolve({ code: -1, stdout, stderr: `${step.cmd} konnte nicht gestartet werden: ${err.message}`, timedOut })
    })
    proc.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code, stdout, stderr, timedOut })
    })
  })
}

/** Test results are reported on stdout so every language only needs a print statement. */
export function parseTests(stdout: string): { tests: TestResult[]; cleanStdout: string } {
  const tests: TestResult[] = []
  const rest: string[] = []
  for (const line of stdout.split('\n')) {
    if (line.startsWith('@@PASS ')) tests.push({ name: line.slice(7), passed: true })
    else if (line.startsWith('@@FAIL ')) {
      const [name, message] = line.slice(7).split(' :: ')
      tests.push({ name, passed: false, message })
    } else if (!line.startsWith('@@RESULT ')) rest.push(line)
  }
  return { tests, cleanStdout: rest.join('\n').trimEnd() }
}

/** Removes temp paths and maps line numbers back to the learner's editor lines. */
function cleanOutput(text: string, dir: string, mainFile: string, displayName: string, userOffset: number): string {
  const withoutDir = text.split(join(dir, mainFile)).join(displayName).split(dir + '/').join('').split(dir).join('')
  const name = displayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const toLine = (n: string) => {
    const line = Number(n) - userOffset
    return line > 0 ? `Zeile ${line}` : 'Test-/Given-Code'
  }
  return withoutDir
    .replace(new RegExp(`File "${name}", line (\\d+)`, 'g'), (_, n) => toLine(n))
    .replace(new RegExp(`${name}[:(](\\d+)`, 'g'), (_, n) => toLine(n))
}

const adapters = new Map<LanguageId, LangAdapter>()
export function register(adapter: LangAdapter) {
  adapters.set(adapter.id, adapter)
}

const availability = new Map<LanguageId, boolean>()

export async function isAvailable(language: LanguageId): Promise<boolean> {
  const cached = availability.get(language)
  if (cached !== undefined) return cached
  const adapter = adapters.get(language)
  if (!adapter) return false
  const res = await exec(adapter.probe, tmpdir(), {}, 15_000)
  const ok = res.code === 0
  availability.set(language, ok)
  return ok
}

export async function availableLanguages(): Promise<Record<LanguageId, boolean>> {
  const entries = await Promise.all([...adapters.keys()].map(async (id) => [id, await isAvailable(id)] as const))
  return Object.fromEntries(entries) as Record<LanguageId, boolean>
}

export async function runCode(req: RunRequest): Promise<RunResponse> {
  const started = Date.now()
  const adapter = adapters.get(req.language)
  const empty = { ok: false, stdout: '', tests: [], durationMs: 0 }
  if (!adapter) return { ...empty, phase: 'unavailable', stderr: `Unbekannte Sprache: ${req.language}` }
  if (!(await isAvailable(req.language))) {
    return {
      ...empty,
      phase: 'unavailable',
      stderr: `${adapter.label} ist auf diesem Rechner nicht installiert.\nInstallation: ${adapter.install}`,
    }
  }

  const dir = await mkdtemp(join(tmpdir(), 'phr-'))
  try {
    const prepared = await adapter.prepare(dir, req)
    const display = prepared.mainFile
    const clean = (text: string) => cleanOutput(text, dir, prepared.mainFile, display, prepared.userOffset)

    if (prepared.compile) {
      const built = await exec(prepared.compile, dir, prepared.env, prepared.timeoutMs)
      if (built.timedOut) {
        return { ...empty, phase: 'timeout', stderr: 'Zeitlimit beim Kompilieren überschritten.', durationMs: Date.now() - started }
      }
      if (built.code !== 0) {
        return {
          ...empty,
          phase: 'compile',
          stderr: clean(built.stderr || built.stdout),
          durationMs: Date.now() - started,
        }
      }
    }

    const result = await exec(prepared.run, dir, prepared.env, prepared.timeoutMs)
    const stderr = clean(result.stderr).replace(/^Picked up JAVA_TOOL_OPTIONS:.*\n?/m, '').trimEnd()
    const { tests, cleanStdout } = parseTests(result.stdout)
    const compileError = result.code !== 0 && tests.length === 0 && /error|Fehler/i.test(stderr) && !prepared.compile
    const phase: RunResponse['phase'] = result.timedOut
      ? 'timeout'
      : compileError
        ? 'compile'
        : result.code !== 0
          ? 'runtime'
          : 'done'
    const ok = phase === 'done' && tests.length > 0 === !!req.tests && tests.every((t) => t.passed)

    return { ok, phase, stdout: cleanStdout, stderr, tests, durationMs: Date.now() - started }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
