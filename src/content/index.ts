import type { ChapterContent, Kata, QuizQuestion, Flashcard } from './types'
import { CHAPTERS, type ChapterMeta } from './curriculum'

const contentModules = import.meta.glob<{ default: ChapterContent }>('./chapters/[0-9]*.ts', { eager: true })
const markdownFiles = import.meta.glob<string>('/docs/chapters/*.md', { query: '?raw', import: 'default', eager: true })
const cheatsheetFiles = import.meta.glob<string>('/docs/cheatsheets/*.md', { query: '?raw', import: 'default', eager: true })

const EMPTY = (id: string): ChapterContent => ({ id, flashcards: [], quiz: [], katas: [] })

const contentById = new Map<string, ChapterContent>()
for (const mod of Object.values(contentModules)) {
  if (mod.default.id !== '00') contentById.set(mod.default.id, mod.default)
}

export interface Chapter extends ChapterMeta {
  markdown: string
  content: ChapterContent
}

export const chapters: Chapter[] = CHAPTERS.map((meta) => ({
  ...meta,
  markdown: markdownFiles[`/docs/chapters/${meta.file}`] ?? `# Kapitel ${meta.id} – ${meta.title}\n\nNoch kein Inhalt.`,
  content: contentById.get(meta.id) ?? EMPTY(meta.id),
}))

export const chapterById = new Map(chapters.map((c) => [c.id, c]))

export const cheatsheets = Object.entries(cheatsheetFiles).map(([path, markdown]) => ({
  slug: path.split('/').pop()!.replace('.md', '').toLowerCase(),
  title: markdown.match(/^#\s+(.+)$/m)?.[1] ?? path,
  markdown,
}))

/** Globally unique key for per-item progress. */
export const key = (chapterId: string, itemId: string) => `${chapterId}/${itemId}`

export interface WithChapter<T> {
  chapter: Chapter
  item: T
  key: string
}

function flatten<T extends { id: string }>(pick: (c: ChapterContent) => T[]): WithChapter<T>[] {
  return chapters.flatMap((chapter) =>
    pick(chapter.content).map((item) => ({ chapter, item, key: key(chapter.id, item.id) })),
  )
}

export const allFlashcards: WithChapter<Flashcard>[] = flatten((c) => c.flashcards)
export const allQuiz: WithChapter<QuizQuestion>[] = flatten((c) => c.quiz)
export const allKatas: WithChapter<Kata>[] = flatten((c) => c.katas)
