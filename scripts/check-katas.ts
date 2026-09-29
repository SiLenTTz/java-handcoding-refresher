/**
 * Runs every runnable kata's reference solution against its tests.
 * Usage: npm run check:katas [-- 01 05]   (optional chapter filter)
 */
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runJava } from '../server/runJava'
import type { ChapterContent } from '../src/content/types'

const filter = process.argv.slice(2)
const dir = join(import.meta.dirname, '../src/content/chapters')
const files = (await readdir(dir)).filter((f) => f.endsWith('.ts')).sort()

let failures = 0
let checked = 0
for (const f of files) {
  const mod = await import(pathToFileURL(join(dir, f)).href)
  const chapter: ChapterContent = mod.default
  if (filter.length && !filter.includes(chapter.id)) continue

  for (const kata of chapter.katas) {
    if (!kata.tests) continue
    checked++
    const res = await runJava({ code: kata.solution, given: kata.given, tests: kata.tests })
    const passed = res.tests.filter((t) => t.passed).length
    if (res.ok && res.tests.length > 0) {
      console.log(`✅ ${chapter.id}/${kata.id}  ${passed}/${res.tests.length}`)
    } else {
      failures++
      console.log(`❌ ${chapter.id}/${kata.id}  phase=${res.phase}  ${passed}/${res.tests.length}`)
      res.tests.filter((t) => !t.passed).forEach((t) => console.log(`     FAIL ${t.name}: ${t.message}`))
      if (res.stderr) console.log(res.stderr.split('\n').map((l) => '     ' + l).join('\n'))
    }
    // The starter must NOT pass the tests (otherwise the kata is trivial).
    const starter = await runJava({ code: kata.starter, given: kata.given, tests: kata.tests })
    if (starter.ok) {
      failures++
      console.log(`❌ ${chapter.id}/${kata.id}  starter already passes all tests`)
    }
  }
}
console.log(`\n${checked} runnable katas checked, ${failures} problems`)
process.exit(failures ? 1 : 0)
