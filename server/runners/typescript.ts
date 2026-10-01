import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { LangAdapter, Prepared, RunRequest } from '../runner'

/** Bundled with the project, so it works no matter what the temp cwd is. */
const TSX = join(import.meta.dirname, '../../node_modules/.bin/tsx')

const PREAMBLE = `const __stats = { passed: 0, failed: 0 }

function __pass(name: string) {
  __stats.passed++
  console.log('@@PASS ' + name)
}

function __fail(name: string, message: string) {
  __stats.failed++
  console.log('@@FAIL ' + name + ' :: ' + message)
}

function __show(value: unknown): string {
  if (value instanceof Map) return 'Map(' + __show([...value.entries()]) + ')'
  if (value instanceof Set) return 'Set(' + __show([...value]) + ')'
  if (typeof value === 'bigint') return String(value) + 'n'
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function __equal(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false
  if (a instanceof Map && b instanceof Map) {
    return a.size === b.size && [...a].every(([k, v]) => b.has(k) && __equal(v, b.get(k)))
  }
  if (a instanceof Set && b instanceof Set) {
    return a.size === b.size && [...a].every((v) => [...b].some((w) => __equal(v, w)))
  }
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a as object)
  const kb = Object.keys(b as object)
  if (ka.length !== kb.length) return false
  return ka.every((k) => __equal((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

function check(name: string, expected: unknown, actual: unknown) {
  if (__equal(expected, actual)) __pass(name)
  else __fail(name, 'erwartet <' + __show(expected) + '> aber war <' + __show(actual) + '>')
}

function checkTrue(name: string, condition: boolean) {
  if (condition) __pass(name)
  else __fail(name, 'Bedingung nicht erfüllt')
}

function checkThrows(name: string, expected: string | (new (...args: never[]) => Error), action: () => unknown) {
  const label = typeof expected === 'string' ? expected : expected.name
  try {
    action()
    __fail(name, 'erwartet ' + label + ', aber nichts geworfen')
  } catch (err) {
    const matches =
      typeof expected === 'string'
        ? String((err as Error)?.message ?? err).includes(expected)
        : err instanceof expected
    if (matches) __pass(name)
    else __fail(name, 'erwartet ' + label + ' aber war ' + String((err as Error)?.message ?? err))
  }
}
`

const USER_MARKER = '// ---- learner code ----'

const IMPORT_RE = /^import[^\n]*?from\s*['"][^'"]+['"];?[ \t]*$|^import\s*['"][^'"]+['"];?[ \t]*$/gm

/** ESM only accepts imports at the top of the module. */
function hoistImports(source: string): { imports: string[]; body: string } {
  const imports = source.match(IMPORT_RE)?.map((l) => l.trim()) ?? []
  return { imports, body: source.replace(IMPORT_RE, '') }
}

export function assembleTypeScript(req: RunRequest): string {
  const user = hoistImports(req.code)
  const given = hoistImports(req.given ?? '')
  const imports = [...new Set([...user.imports, ...given.imports])].join('\n')

  if (!req.tests) {
    return `${imports}\n${USER_MARKER}\n${user.body}\n\n${given.body}\n`
  }
  return `${imports}
${PREAMBLE}
// ---- given ----
${given.body}

${USER_MARKER}
${user.body}

async function __runTests() {
${req.tests}
}

__runTests()
  .catch((err) => __fail('Exception', String(err?.message ?? err)))
  .finally(() => console.log('@@RESULT ' + __stats.passed + '/' + (__stats.passed + __stats.failed)))

export {}
`
}

export const typescriptAdapter: LangAdapter = {
  id: 'typescript',
  label: 'TypeScript (Node)',
  probe: { cmd: TSX, args: ['--version'] },
  install: 'npm install (tsx ist eine Dependency dieses Repos)',
  async prepare(dir, req): Promise<Prepared> {
    const source = assembleTypeScript(req)
    await writeFile(join(dir, 'main.ts'), source, 'utf8')
    return {
      run: { cmd: TSX, args: ['main.ts'] },
      mainFile: 'main.ts',
      userOffset: source.split('\n').indexOf(USER_MARKER) + 1,
    }
  },
}
