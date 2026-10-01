import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { LangAdapter, Prepared, RunRequest } from '../runner'

const PREAMBLE = `var __passed = 0
var __failed = 0

func __pass(name string) {
	__passed++
	fmt.Println("@@PASS " + name)
}

func __fail(name string, message string) {
	__failed++
	fmt.Println("@@FAIL " + name + " :: " + message)
}

func check(name string, expected interface{}, actual interface{}) {
	if reflect.DeepEqual(expected, actual) {
		__pass(name)
	} else {
		__fail(name, fmt.Sprintf("erwartet <%v> aber war <%v>", expected, actual))
	}
}

func checkTrue(name string, condition bool) {
	if condition {
		__pass(name)
	} else {
		__fail(name, "Bedingung nicht erfüllt")
	}
}

func checkErr(name string, wantErr bool, err error) {
	if wantErr && err == nil {
		__fail(name, "erwartet einen Fehler, bekam nil")
	} else if !wantErr && err != nil {
		__fail(name, "unerwarteter Fehler: "+err.Error())
	} else {
		__pass(name)
	}
}

func checkPanics(name string, action func()) {
	defer func() {
		if r := recover(); r != nil {
			__pass(name)
		} else {
			__fail(name, "erwartet einen Panic, aber nichts passiert")
		}
	}()
	action()
}
`

const USER_MARKER = '// ---- learner code ----'

const IMPORT_BLOCK_RE = /^import\s*\(([\s\S]*?)^\)\s*$/gm
const IMPORT_LINE_RE = /^import\s+((?:[\w.]+\s+)?"[^"]+")\s*$/gm

/** Go only accepts imports directly after the package clause. */
function hoistImports(source: string): { imports: string[]; body: string } {
  const imports: string[] = []
  let body = source.replace(IMPORT_BLOCK_RE, (_, inner: string) => {
    for (const line of inner.split('\n')) {
      const trimmed = line.trim()
      if (trimmed) imports.push(trimmed)
    }
    return ''
  })
  body = body.replace(IMPORT_LINE_RE, (_, spec: string) => {
    imports.push(spec.trim())
    return ''
  })
  return { imports, body }
}

export function assembleGo(req: RunRequest): string {
  const user = hoistImports(req.code)
  const given = hoistImports(req.given ?? '')
  const imports = [...new Set(['"fmt"', '"reflect"', ...user.imports, ...given.imports])]
  const header = `package main\n\nimport (\n${imports.map((i) => '\t' + i).join('\n')}\n)\n`

  if (!req.tests) {
    const own = [...new Set([...user.imports, ...given.imports])]
    const plain = own.length ? `package main\n\nimport (\n${own.map((i) => '\t' + i).join('\n')}\n)\n` : 'package main\n'
    return `${plain}\n${user.body}\n\n${given.body}\n`
  }
  return `${header}
${PREAMBLE}
// ---- given ----
${given.body}

${USER_MARKER}
${user.body}

func main() {
	defer func() {
		if r := recover(); r != nil {
			__fail("Panic", fmt.Sprintf("%v", r))
		}
		fmt.Printf("@@RESULT %d/%d\\n", __passed, __passed+__failed)
	}()
${req.tests}
}
`
}

export const goAdapter: LangAdapter = {
  id: 'go',
  label: 'Go',
  probe: { cmd: 'go', args: ['version'] },
  install: 'brew install go',
  async prepare(dir, req): Promise<Prepared> {
    const source = assembleGo(req)
    await writeFile(join(dir, 'main.go'), source, 'utf8')
    return {
      run: { cmd: 'go', args: ['run', 'main.go'] },
      mainFile: 'main.go',
      userOffset: source.split('\n').indexOf(USER_MARKER) + 1,
      env: { GOFLAGS: '-mod=mod', GOTOOLCHAIN: 'local' },
    }
  },
}
