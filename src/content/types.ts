/**
 * Content schema. Markdown is allowed in all "md" fields
 * (inline code with backticks, **bold**, lists, fenced code blocks).
 */

export type Level = 1 | 2 | 3 | 4 | 5

export interface Flashcard {
  id: string
  /** Question side (markdown) */
  front: string
  /** Answer side (markdown) */
  back: string
}

export interface QuizQuestion {
  id: string
  /** Question (markdown) */
  prompt: string
  /** Optional Java snippet shown below the prompt */
  code?: string
  options: string[]
  /** Index into options */
  correct: number
  /** Why the correct answer is correct (markdown) */
  explanation: string
}

export interface Kata {
  id: string
  title: string
  level: Level
  /** Task description (markdown) */
  description: string
  /**
   * Read-only Java types the kata relies on (records, enums, interfaces).
   * Shown to the learner and compiled together with their code.
   * No imports needed: java.util.*, java.util.stream.*, java.util.function.*,
   * java.math.*, java.time.* are imported automatically.
   */
  given?: string
  /** Initial editor content */
  starter: string
  /** Reference solution – only shown after the first attempt */
  solution: string
  /** Progressive hints: concept → API → pseudocode → partial code */
  hints: string[]
  /**
   * Body of `public static void main` of the test harness.
   * Use check("name", expected, actual) and checkTrue("name", condition).
   * If absent, the kata is "write & compare" only (e.g. Spring code).
   */
  tests?: string
}

export interface ChapterContent {
  /** Two-digit chapter number, e.g. "01" */
  id: string
  flashcards: Flashcard[]
  quiz: QuizQuestion[]
  katas: Kata[]
}

export interface ChapterMeta {
  id: string
  title: string
  /** Key into `Curriculum.modules` */
  module: string
  /** Markdown file name inside docs/<track>/chapters */
  file: string
}

export interface Curriculum {
  modules: Record<string, string>
  chapters: ChapterMeta[]
}
