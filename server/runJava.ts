import { spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export interface RunRequest {
  /** Learner code */
  code: string
  /** Read-only types from the kata */
  given?: string
  /** Body of the test harness main method. If absent, the learner code must contain its own main. */
  tests?: string
}

export interface TestResult {
  name: string
  passed: boolean
  message?: string
}

export interface RunResponse {
  ok: boolean
  phase: 'compile' | 'runtime' | 'timeout' | 'done'
  stdout: string
  stderr: string
  tests: TestResult[]
  durationMs: number
}

const DEFAULT_IMPORTS = [
  'java.util.*',
  'java.util.stream.*',
  'java.util.function.*',
  'java.math.*',
  'java.time.*',
]

const TIMEOUT_MS = 10_000
const MAX_OUTPUT = 64_000

const IMPORT_RE = /^[ \t]*import[ \t]+(static[ \t]+)?[\w.]+(\.\*)?[ \t]*;[ \t]*$/gm

function hoistImports(source: string): { imports: string[]; body: string } {
  const imports = source.match(IMPORT_RE)?.map((l) => l.trim()) ?? []
  return { imports, body: source.replace(IMPORT_RE, '') }
}

const HARNESS_HELPERS = `
    static int __passed = 0;
    static int __failed = 0;

    static void check(String name, Object expected, Object actual) {
        if (Objects.equals(expected, actual)) {
            __passed++;
            System.out.println("@@PASS " + name);
        } else {
            __failed++;
            System.out.println("@@FAIL " + name + " :: erwartet <" + expected + "> aber war <" + actual + ">");
        }
    }

    static void checkTrue(String name, boolean condition) {
        if (condition) {
            __passed++;
            System.out.println("@@PASS " + name);
        } else {
            __failed++;
            System.out.println("@@FAIL " + name + " :: Bedingung nicht erfüllt");
        }
    }

    static void checkThrows(String name, Class<? extends Throwable> type, Runnable action) {
        try {
            action.run();
            __failed++;
            System.out.println("@@FAIL " + name + " :: erwartet " + type.getSimpleName() + ", aber nichts geworfen");
        } catch (Throwable t) {
            if (type.isInstance(t)) {
                __passed++;
                System.out.println("@@PASS " + name);
            } else {
                __failed++;
                System.out.println("@@FAIL " + name + " :: erwartet " + type.getSimpleName() + " aber war " + t.getClass().getSimpleName());
            }
        }
    }
`

/** Builds a single-file Java program (Java 11+ source launcher). The first class holds main. */
export function buildSource(req: RunRequest): string {
  return build(req).source
}

const USER_MARKER = '// ---- learner code ----'

/**
 * Returns the program plus the line offset of the learner code, so compiler
 * line numbers can be mapped back to the editor. Imports are blanked (not removed)
 * to keep learner line numbers stable.
 */
function build(req: RunRequest): { source: string; userOffset: number } {
  const source = assemble(req)
  const lines = source.split('\n')
  const marker = lines.indexOf(USER_MARKER)
  return { source, userOffset: marker + 1 }
}

function assemble(req: RunRequest): string {
  const user = hoistImports(req.code)
  const given = hoistImports(req.given ?? '')
  const imports = new Set([...DEFAULT_IMPORTS.map((i) => `import ${i};`), ...user.imports, ...given.imports])

  if (!req.tests) {
    // Playground: learner code runs as-is, but must come first so its main class is launched.
    return `${[...imports].join('\n')}\n${USER_MARKER}\n${user.body}\n\n${given.body}\n`
  }

  return `${[...imports].join('\n')}

public class __TestRunner {
${HARNESS_HELPERS}
    public static void main(String[] args) throws Exception {
        try {
${req.tests}
        } catch (Throwable t) {
            __failed++;
            System.out.println("@@FAIL Exception :: " + t);
        }
        System.out.println("@@RESULT " + __passed + "/" + (__passed + __failed));
    }
}

// ---- given ----
${given.body}

${USER_MARKER}
${user.body}
`
}

function parseTests(stdout: string): { tests: TestResult[]; cleanStdout: string } {
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

/** Removes temp paths and maps line numbers to the learner's editor lines. */
function cleanStderr(stderr: string, file: string, userOffset: number): string {
  return stderr
    .split(file)
    .join('Main.java')
    .replace(/Main\.java:(\d+)/g, (_, n) => {
      const line = Number(n) - userOffset
      return line > 0 ? `Zeile ${line}` : 'Test-/Given-Code'
    })
}

export async function runJava(req: RunRequest): Promise<RunResponse> {
  const started = Date.now()
  const dir = await mkdtemp(join(tmpdir(), 'jhr-'))
  const file = join(dir, 'Main.java')
  const { source, userOffset } = build(req)
  await writeFile(file, source, 'utf8')

  try {
    const result = await new Promise<{ code: number | null; stdout: string; stderr: string; timedOut: boolean }>(
      (resolve) => {
        const proc = spawn('java', ['-Xmx256m', '-XX:+UseSerialGC', '-Xshare:auto', file], {
          cwd: dir,
          env: { ...process.env, JAVA_TOOL_OPTIONS: '' },
        })
        let stdout = ''
        let stderr = ''
        let timedOut = false
        const timer = setTimeout(() => {
          timedOut = true
          proc.kill('SIGKILL')
        }, TIMEOUT_MS)
        proc.stdout.on('data', (d) => {
          if (stdout.length < MAX_OUTPUT) stdout += d
        })
        proc.stderr.on('data', (d) => {
          if (stderr.length < MAX_OUTPUT) stderr += d
        })
        proc.on('error', (err) => {
          clearTimeout(timer)
          resolve({ code: -1, stdout, stderr: `Java konnte nicht gestartet werden: ${err.message}`, timedOut })
        })
        proc.on('close', (code) => {
          clearTimeout(timer)
          resolve({ code, stdout, stderr, timedOut })
        })
      },
    )

    const stderr = cleanStderr(result.stderr, file, userOffset).replace(/^Picked up JAVA_TOOL_OPTIONS:.*\n?/m, '')
    const { tests, cleanStdout } = parseTests(result.stdout)
    const compileError = result.code !== 0 && /error: compilation failed/.test(stderr)
    const phase: RunResponse['phase'] = result.timedOut
      ? 'timeout'
      : compileError
        ? 'compile'
        : result.code !== 0
          ? 'runtime'
          : 'done'
    const ok = phase === 'done' && tests.every((t) => t.passed)

    return { ok, phase, stdout: cleanStdout, stderr, tests, durationMs: Date.now() - started }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
