import { allFlashcards, allKatas, allQuiz, inTrack, key, type Chapter, type Track, type TrackId, type WithChapter } from '../content'
import { isDue, statusRank, type Progress, type Status } from './progress'

export function chapterStatus(p: Progress, chapterUid: string): Status {
  return p.chapterStatus[chapterUid] ?? 'UNKNOWN'
}

export function chapterStats(p: Progress, chapter: Chapter) {
  const katas = chapter.content.katas
  const solved = katas.filter((k) => p.katas[key(chapter.uid, k.id)]?.solved).length
  const cards = chapter.content.flashcards
  const learnedCards = cards.filter((c) => (p.cards[key(chapter.uid, c.id)]?.box ?? 0) >= 2).length
  return {
    solved,
    katas: katas.length,
    learnedCards,
    cards: cards.length,
    quiz: p.quiz[chapter.uid],
    read: !!p.chapterRead[chapter.uid],
  }
}

const scope = <T>(items: WithChapter<T>[], track?: TrackId) => (track ? inTrack(items, track) : items)

export function dueCards(p: Progress, track?: TrackId) {
  return scope(allFlashcards, track).filter((c) => p.cards[c.key] && isDue(p.cards[c.key]))
}

/** Cards not yet seen, from chapters the learner has already opened (read). */
export function newCards(p: Progress, track?: TrackId) {
  return scope(allFlashcards, track).filter((c) => !p.cards[c.key] && p.chapterRead[c.chapter.uid])
}

export function solvedKatas(p: Progress, track?: TrackId) {
  return scope(allKatas, track).filter((k) => p.katas[k.key]?.solved).length
}

export function trackTotals(p: Progress, track: TrackId) {
  return {
    cards: scope(allFlashcards, track).length,
    quiz: scope(allQuiz, track).length,
    katas: scope(allKatas, track).length,
    solved: solvedKatas(p, track),
    due: dueCards(p, track).length,
  }
}

/**
 * Next recommended chapter: first chapter (in curriculum order) that is not yet OK,
 * but weak chapters that were already worked on take priority.
 */
export function recommendedChapter(p: Progress, track: Track): Chapter | undefined {
  const chapters = track.chapters
  if (chapters.length === 0) return undefined
  const weak = chapters.find((c) => ['WEAK', 'LEARNING'].includes(chapterStatus(p, c.uid)) && p.quiz[c.uid])
  if (weak) return weak
  return chapters.find((c) => statusRank(chapterStatus(p, c.uid)) < statusRank('OK')) ?? chapters[chapters.length - 1]
}
