import { allFlashcards, allKatas, chapters, key, type Chapter } from '../content'
import { isDue, statusRank, type Progress, type Status } from './progress'

export function chapterStatus(p: Progress, chapterId: string): Status {
  return p.chapterStatus[chapterId] ?? 'UNKNOWN'
}

export function chapterStats(p: Progress, chapter: Chapter) {
  const katas = chapter.content.katas
  const solved = katas.filter((k) => p.katas[key(chapter.id, k.id)]?.solved).length
  const cards = chapter.content.flashcards
  const learnedCards = cards.filter((c) => (p.cards[key(chapter.id, c.id)]?.box ?? 0) >= 2).length
  return {
    solved,
    katas: katas.length,
    learnedCards,
    cards: cards.length,
    quiz: p.quiz[chapter.id],
    read: !!p.chapterRead[chapter.id],
  }
}

export function dueCards(p: Progress) {
  return allFlashcards.filter((c) => p.cards[c.key] && isDue(p.cards[c.key]))
}

/** Cards not yet seen, from chapters the learner has already opened (read). */
export function newCards(p: Progress) {
  return allFlashcards.filter((c) => !p.cards[c.key] && p.chapterRead[c.chapter.id])
}

export function solvedKatas(p: Progress) {
  return allKatas.filter((k) => p.katas[k.key]?.solved).length
}

/**
 * Next recommended chapter: first chapter (in curriculum order) that is not yet OK,
 * but weak chapters that were already worked on take priority.
 */
export function recommendedChapter(p: Progress): Chapter {
  const weak = chapters.find((c) => ['WEAK', 'LEARNING'].includes(chapterStatus(p, c.id)) && p.quiz[c.id])
  if (weak) return weak
  return chapters.find((c) => statusRank(chapterStatus(p, c.id)) < statusRank('OK')) ?? chapters[chapters.length - 1]
}
