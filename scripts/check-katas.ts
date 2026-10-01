/**
 * Runs every runnable kata's reference solution against its tests.
 * Usage: npm run check:katas [-- java 01 05]   (optional track / chapter filter)
 */
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { isAvailable, runCode, LANGUAGES, type LanguageId } from '../server/runners'
import type { ChapterContent } from '../src/content/types'

const args = process.argv.slice(2)
const trackFilter = args.filter((a): a is LanguageId => (LANGUAGES as readonly string[]).includes(a))
const chapterFilter = args.filter((a) => !trackFilter.includes(a as LanguageId))
const tracks = trackFilter.length ? trackFilter : LANGUAGES

let failures = 0
let checked = 0
for (const track of tracks) {
  const dir = join(import.meta.dirname, '../src/content', track, 'chapters')
  const files = await readdir(dir).catch(() => [])
  const runnable = files.filter((f) => f.endsWith('.ts')).sort()
  if (runnable.length === 0) continue

  if (!(await isAvailable(track))) {
    console.log(`⏭  ${track}: Toolchain nicht installiert, übersprungen`)
    continue
  }

  for (const f of runnable) {
    const mod = await import(pathToFileURL(join(dir, f)).href)
    const chapter: ChapterContent = mod.default
    if (chapterFilter.length && !chapterFilter.includes(chapter.id)) continue

    for (const kata of chapter.katas) {
      if (!kata.tests) continue
      checked++
      const res = await runCode({ language: track, code: kata.solution, given: kata.given, tests: kata.tests })
      const passed = res.tests.filter((t) => t.passed).length
      if (res.ok && res.tests.length > 0) {
        console.log(`✅ ${track}/${chapter.id}/${kata.id}  ${passed}/${res.tests.length}`)
      } else {
        failures++
        console.log(`❌ ${track}/${chapter.id}/${kata.id}  phase=${res.phase}  ${passed}/${res.tests.length}`)
        res.tests.filter((t) => !t.passed).forEach((t) => console.log(`     FAIL ${t.name}: ${t.message}`))
        if (res.stderr) console.log(res.stderr.split('\n').map((l) => '     ' + l).join('\n'))
      }
      // The starter must NOT pass the tests (otherwise the kata is trivial).
      const starter = await runCode({ language: track, code: kata.starter, given: kata.given, tests: kata.tests })
      if (starter.ok) {
        failures++
        console.log(`❌ ${track}/${chapter.id}/${kata.id}  starter already passes all tests`)
      }
    }
  }
}
console.log(`\n${checked} runnable katas checked, ${failures} problems`)
process.exit(failures ? 1 : 0)
