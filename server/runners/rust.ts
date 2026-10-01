import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { LangAdapter, Prepared, RunRequest } from '../runner'

const PREAMBLE = `#![allow(dead_code, unused_imports, unused_variables, unused_mut)]
use std::collections::{BTreeMap, BTreeSet, HashMap, HashSet, VecDeque};
use std::fmt::Debug;
use std::sync::atomic::{AtomicUsize, Ordering};

static __PASSED: AtomicUsize = AtomicUsize::new(0);
static __FAILED: AtomicUsize = AtomicUsize::new(0);

fn __pass(name: &str) {
    __PASSED.fetch_add(1, Ordering::SeqCst);
    println!("@@PASS {}", name);
}

fn __fail(name: &str, message: String) {
    __FAILED.fetch_add(1, Ordering::SeqCst);
    println!("@@FAIL {} :: {}", name, message);
}

fn check<T: PartialEq + Debug>(name: &str, expected: T, actual: T) {
    if expected == actual {
        __pass(name);
    } else {
        __fail(name, format!("erwartet <{:?}> aber war <{:?}>", expected, actual));
    }
}

fn check_true(name: &str, condition: bool) {
    if condition {
        __pass(name);
    } else {
        __fail(name, "Bedingung nicht erfüllt".to_string());
    }
}

fn check_panics<F: FnOnce() + std::panic::UnwindSafe>(name: &str, action: F) {
    let hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(|_| {}));
    let result = std::panic::catch_unwind(action);
    std::panic::set_hook(hook);
    if result.is_err() {
        __pass(name);
    } else {
        __fail(name, "erwartet einen Panic, aber nichts passiert".to_string());
    }
}
`

const USER_MARKER = '// ---- learner code ----'

export function assembleRust(req: RunRequest): string {
  if (!req.tests) {
    return `${req.code}\n\n${req.given ?? ''}\n`
  }
  return `${PREAMBLE}
// ---- given ----
${req.given ?? ''}

${USER_MARKER}
${req.code}

fn main() {
${req.tests}
    println!(
        "@@RESULT {}/{}",
        __PASSED.load(Ordering::SeqCst),
        __PASSED.load(Ordering::SeqCst) + __FAILED.load(Ordering::SeqCst)
    );
}
`
}

export const rustAdapter: LangAdapter = {
  id: 'rust',
  label: 'Rust',
  probe: { cmd: 'rustc', args: ['--version'] },
  install: 'brew install rust',
  async prepare(dir, req): Promise<Prepared> {
    const source = assembleRust(req)
    await writeFile(join(dir, 'main.rs'), source, 'utf8')
    return {
      compile: { cmd: 'rustc', args: ['-O', '--edition', '2021', '-o', 'main', 'main.rs'] },
      run: { cmd: join(dir, 'main'), args: [] },
      mainFile: 'main.rs',
      userOffset: source.split('\n').indexOf(USER_MARKER) + 1,
    }
  },
}
