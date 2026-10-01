import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { LangAdapter, Prepared, RunRequest } from '../runner'

const DEFAULT_IMPORTS = ['java.util.*', 'java.util.stream.*', 'java.util.function.*', 'java.math.*', 'java.time.*']

const IMPORT_RE = /^[ \t]*import[ \t]+(static[ \t]+)?[\w.]+(\.\*)?[ \t]*;[ \t]*$/gm

function hoistImports(source: string): { imports: string[]; body: string } {
  const imports = source.match(IMPORT_RE)?.map((l) => l.trim()) ?? []
  return { imports, body: source.replace(IMPORT_RE, '') }
}

const HARNESS = `
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

const USER_MARKER = '// ---- learner code ----'

export function assembleJava(req: RunRequest): string {
  const user = hoistImports(req.code)
  const given = hoistImports(req.given ?? '')
  const imports = new Set([...DEFAULT_IMPORTS.map((i) => `import ${i};`), ...user.imports, ...given.imports])

  if (!req.tests) {
    return `${[...imports].join('\n')}\n${USER_MARKER}\n${user.body}\n\n${given.body}\n`
  }

  return `${[...imports].join('\n')}

public class __TestRunner {
${HARNESS}
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

export const javaAdapter: LangAdapter = {
  id: 'java',
  label: 'Java 21',
  probe: { cmd: 'java', args: ['-version'] },
  install: 'brew install --cask corretto@21',
  async prepare(dir, req): Promise<Prepared> {
    const source = assembleJava(req)
    await writeFile(join(dir, 'Main.java'), source, 'utf8')
    return {
      run: { cmd: 'java', args: ['-Xmx256m', '-XX:+UseSerialGC', '-Xshare:auto', join(dir, 'Main.java')] },
      mainFile: 'Main.java',
      userOffset: source.split('\n').indexOf(USER_MARKER) + 1,
    }
  },
}
