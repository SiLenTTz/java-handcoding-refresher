import { useSyncExternalStore } from 'react'
import { addDays, today } from './dates'

export const STATUSES = ['UNKNOWN', 'LEARNING', 'WEAK', 'OK', 'STRONG', 'MASTERED'] as const
export type Status = (typeof STATUSES)[number]

export const MISTAKE_CATEGORIES = ['SYNTAX', 'API', 'CONCEPT', 'DESIGN', 'ARCHITECTURE', 'CLEAN_CODE', 'EDGE_CASE'] as const
export type MistakeCategory = (typeof MISTAKE_CATEGORIES)[number]

export interface CardState {
  /** Leitner box 0..5 */
  box: number
  due: string
  reviews: number
  lapses: number
}

export interface KataState {
  code: string
  attempts: number
  solved: boolean
  revealed: boolean
  hintsShown: number
  bestTimeMs?: number
}

export interface QuizResult {
  best: number
  last: number
  date: string
}

export interface Mistake {
  id: string
  date: string
  chapterId: string
  category: MistakeCategory
  text: string
  source: 'quiz' | 'exam' | 'manual' | 'kata'
  resolved: boolean
}

export interface ExamResult {
  date: string
  score: number
  total: number
  durationMs: number
  track?: string
}

export interface Progress {
  version: 2
  /** Track the learner is currently working in. */
  activeTrack: string
  chapterStatus: Record<string, Status>
  chapterRead: Record<string, boolean>
  quiz: Record<string, QuizResult>
  cards: Record<string, CardState>
  katas: Record<string, KataState>
  mistakes: Mistake[]
  exams: ExamResult[]
  activeDays: string[]
  playground: Record<string, string>
}

const STORAGE_KEY = 'jhr-progress-v1'

const initial = (): Progress => ({
  version: 2,
  activeTrack: 'java',
  chapterStatus: {},
  chapterRead: {},
  quiz: {},
  cards: {},
  katas: {},
  mistakes: [],
  exams: [],
  activeDays: [],
  playground: {},
})

const prefixKeys = <T>(record: Record<string, T>, prefix: string): Record<string, T> =>
  Object.fromEntries(Object.entries(record ?? {}).map(([k, v]) => [`${prefix}/${k}`, v]))

/** v1 stored Java-only progress under bare chapter ids like `07` or `07/k1`. */
function migrate(raw: Record<string, unknown>): Progress {
  if (raw.version === 2) return { ...initial(), ...(raw as unknown as Progress) }
  const old = raw as unknown as Omit<Progress, 'version' | 'activeTrack' | 'playground'> & { playground?: string }
  return {
    ...initial(),
    chapterStatus: prefixKeys(old.chapterStatus, 'java'),
    chapterRead: prefixKeys(old.chapterRead, 'java'),
    quiz: prefixKeys(old.quiz, 'java'),
    cards: prefixKeys(old.cards, 'java'),
    katas: prefixKeys(old.katas, 'java'),
    mistakes: (old.mistakes ?? []).map((m) => ({ ...m, chapterId: `java/${m.chapterId}` })),
    exams: old.exams ?? [],
    activeDays: old.activeDays ?? [],
    playground: old.playground ? { java: old.playground } : {},
  }
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? migrate(JSON.parse(raw)) : initial()
  } catch {
    return initial()
  }
}

let state: Progress = load()
const listeners = new Set<() => void>()

function commit(next: Progress) {
  state = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  listeners.forEach((l) => l())
}

/** Applies a change and marks today as an active learning day. */
export function update(fn: (draft: Progress) => void, { activity = true } = {}) {
  const draft = structuredClone(state)
  fn(draft)
  if (activity && !draft.activeDays.includes(today())) draft.activeDays.push(today())
  commit(draft)
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

export const loadProgress = (): Progress => state

export function setActiveTrack(track: string) {
  if (state.activeTrack === track) return
  update((p) => void (p.activeTrack = track), { activity: false })
}

export function exportProgress(): string {
  return JSON.stringify(state, null, 2)
}

export function importProgress(json: string) {
  commit(migrate(JSON.parse(json)))
}

export function resetProgress() {
  commit(initial())
}

// ---------- Flashcards (Leitner) ----------

/** Days until next review per box. */
const INTERVALS = [0, 1, 2, 4, 8, 16]

export function isDue(card: CardState | undefined): boolean {
  return !card || card.due <= today()
}

export function gradeCard(cardKey: string, knew: boolean) {
  update((p) => {
    const prev = p.cards[cardKey] ?? { box: 0, due: today(), reviews: 0, lapses: 0 }
    const box = knew ? Math.min(prev.box + 1, INTERVALS.length - 1) : 0
    p.cards[cardKey] = {
      box,
      due: addDays(today(), knew ? INTERVALS[box] : 0),
      reviews: prev.reviews + 1,
      lapses: prev.lapses + (knew ? 0 : 1),
    }
  })
}

// ---------- Mistakes ----------

export function addMistake(m: Omit<Mistake, 'id' | 'date' | 'resolved'>) {
  update((p) => {
    // Don't log the same auto-mistake twice while it's open.
    if (m.source !== 'manual' && p.mistakes.some((x) => !x.resolved && x.text === m.text)) return
    p.mistakes.unshift({ ...m, id: crypto.randomUUID(), date: today(), resolved: false })
  })
}

// ---------- Status ----------

export function statusFromScore(percent: number): Status {
  if (percent >= 95) return 'STRONG'
  if (percent >= 80) return 'OK'
  if (percent >= 60) return 'WEAK'
  return 'LEARNING'
}

const RANK: Record<Status, number> = { UNKNOWN: 0, LEARNING: 1, WEAK: 2, OK: 3, STRONG: 4, MASTERED: 5 }

export const statusRank = (s: Status) => RANK[s]

export const STATUS_STYLE: Record<Status, string> = {
  UNKNOWN: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  LEARNING: 'bg-sky-950 text-sky-300 border-sky-800',
  WEAK: 'bg-rose-950 text-rose-300 border-rose-800',
  OK: 'bg-amber-950 text-amber-300 border-amber-800',
  STRONG: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  MASTERED: 'bg-violet-950 text-violet-300 border-violet-700',
}
