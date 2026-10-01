import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { LangAdapter, Prepared, RunRequest } from '../runner'

const PREAMBLE = `import json
import math
import re
import sys
from collections import Counter, defaultdict, deque, namedtuple
from dataclasses import dataclass, field, replace
from datetime import date, datetime, timedelta
from decimal import Decimal
from enum import Enum, auto
from functools import cached_property, lru_cache, reduce
from itertools import chain, groupby, islice
from typing import Any, Callable, Iterable, Iterator, Optional, Protocol, Sequence

__stats = {"passed": 0, "failed": 0}


def __pass(name):
    __stats["passed"] += 1
    print("@@PASS " + name)


def __fail(name, message):
    __stats["failed"] += 1
    print("@@FAIL " + name + " :: " + message)


def check(name, expected, actual):
    if expected == actual:
        __pass(name)
    else:
        __fail(name, "erwartet <" + repr(expected) + "> aber war <" + repr(actual) + ">")


def check_true(name, condition):
    if condition:
        __pass(name)
    else:
        __fail(name, "Bedingung nicht erfüllt")


def check_raises(name, exc_type, fn):
    try:
        fn()
        __fail(name, "erwartet " + exc_type.__name__ + ", aber nichts geworfen")
    except BaseException as err:
        if isinstance(err, exc_type):
            __pass(name)
        else:
            __fail(name, "erwartet " + exc_type.__name__ + " aber war " + type(err).__name__)
`

const USER_MARKER = '# ---- learner code ----'

const indent = (block: string) => block.split('\n').map((l) => (l.trim() ? '    ' + l : l)).join('\n')

export function assemblePython(req: RunRequest): string {
  if (!req.tests) {
    return `${USER_MARKER}\n${req.code}\n\n${req.given ?? ''}\n`
  }
  return `${PREAMBLE}
# ---- given ----
${req.given ?? ''}

${USER_MARKER}
${req.code}


def __run_tests():
${indent(req.tests)}


try:
    __run_tests()
except BaseException as __err:
    __fail("Exception", type(__err).__name__ + ": " + str(__err))
print("@@RESULT " + str(__stats["passed"]) + "/" + str(__stats["passed"] + __stats["failed"]))
`
}

export const pythonAdapter: LangAdapter = {
  id: 'python',
  label: 'Python 3',
  probe: { cmd: 'python3', args: ['--version'] },
  install: 'brew install python@3.12',
  async prepare(dir, req): Promise<Prepared> {
    const source = assemblePython(req)
    await writeFile(join(dir, 'main.py'), source, 'utf8')
    return {
      run: { cmd: 'python3', args: ['main.py'] },
      mainFile: 'main.py',
      userOffset: source.split('\n').indexOf(USER_MARKER) + 1,
      env: { PYTHONDONTWRITEBYTECODE: '1' },
    }
  },
}
