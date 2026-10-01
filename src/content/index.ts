import type { ChapterContent, ChapterMeta, Curriculum, Flashcard, Kata, QuizQuestion } from './types'
import { TRACKS, TRACK_IDS, type TrackId, type TrackMeta } from './tracks'

const curriculumModules = import.meta.glob<{ default: Curriculum }>('./*/curriculum.ts', { eager: true })
const contentModules = import.meta.glob<{ default: ChapterContent }>('./*/chapters/[0-9]*.ts', { eager: true })
const markdownFiles = import.meta.glob<string>('/docs/*/chapters/*.md', { query: '?raw', import: 'default', eager: true })
const cheatsheetFiles = import.meta.glob<string>('/docs/*/cheatsheets/*.md', { query: '?raw', import: 'default', eager: true })

const EMPTY = (id: string): ChapterContent => ({ id, flashcards: [], quiz: [], katas: [] })

/** `./python/chapters/03.ts` and `/docs/python/chapters/03-x.md` both yield `python`. */
const trackOf = (path: string) => path.split('/').filter(Boolean)[path.startsWith('.') ? 0 : 1] as TrackId

const contentByTrack = new Map<TrackId, Map<string, ChapterContent>>()
for (const [path, mod] of Object.entries(contentModules)) {
  if (mod.default.id === '00') continue
  const track = trackOf(path)
  if (!contentByTrack.has(track)) contentByTrack.set(track, new Map())
  contentByTrack.get(track)!.set(mod.default.id, mod.default)
}

export interface Chapter extends ChapterMeta {
  track: TrackMeta
  /** Globally unique across tracks, e.g. `java/07`. Used for all progress keys. */
  uid: string
  markdown: string
  content: ChapterContent
}

export interface Track extends TrackMeta {
  modules: Record<string, string>
  chapters: Chapter[]
}

function buildTrack(meta: TrackMeta): Track {
  const curriculum = curriculumModules[`./${meta.id}/curriculum.ts`]?.default
  const content = contentByTrack.get(meta.id)
  const chapters = (curriculum?.chapters ?? []).map((chapterMeta) => ({
    ...chapterMeta,
    track: meta,
    uid: `${meta.id}/${chapterMeta.id}`,
    markdown:
      markdownFiles[`/docs/${meta.id}/chapters/${chapterMeta.file}`] ??
      `# Kapitel ${chapterMeta.id} – ${chapterMeta.title}\n\nNoch kein Inhalt.`,
    content: content?.get(chapterMeta.id) ?? EMPTY(chapterMeta.id),
  }))
  return { ...meta, modules: curriculum?.modules ?? {}, chapters }
}

export const tracks: Track[] = TRACK_IDS.map((id) => buildTrack(TRACKS[id]))
export const trackById = new Map(tracks.map((t) => [t.id, t]))

export const allChapters: Chapter[] = tracks.flatMap((t) => t.chapters)
export const chapterByUid = new Map(allChapters.map((c) => [c.uid, c]))

const size = (c: ChapterContent) => c.flashcards.length + c.quiz.length + c.katas.length

/** A track is only offered once at least one chapter actually has content. */
export const hasContent = (track: Track) => track.chapters.some((c) => size(c.content) > 0)

export const cheatsheets = Object.entries(cheatsheetFiles).map(([path, markdown]) => ({
  track: trackOf(path),
  slug: path.split('/').pop()!.replace('.md', '').toLowerCase(),
  title: markdown.match(/^#\s+(.+)$/m)?.[1] ?? path,
  markdown,
}))

/** Globally unique key for per-item progress. */
export const key = (chapterUid: string, itemId: string) => `${chapterUid}/${itemId}`

export interface WithChapter<T> {
  chapter: Chapter
  item: T
  key: string
}

function flatten<T extends { id: string }>(pick: (c: ChapterContent) => T[]): WithChapter<T>[] {
  return allChapters.flatMap((chapter) =>
    pick(chapter.content).map((item) => ({ chapter, item, key: key(chapter.uid, item.id) })),
  )
}

export const allFlashcards: WithChapter<Flashcard>[] = flatten((c) => c.flashcards)
export const allQuiz: WithChapter<QuizQuestion>[] = flatten((c) => c.quiz)
export const allKatas: WithChapter<Kata>[] = flatten((c) => c.katas)

export const inTrack = <T>(items: WithChapter<T>[], track: TrackId) => items.filter((i) => i.chapter.track.id === track)

export { TRACKS, TRACK_IDS, trackList, isTrackId } from './tracks'
export type { TrackId, TrackMeta } from './tracks'
