import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { WithChapter } from '../content'
import type { Flashcard } from '../content/types'
import { gradeCard } from '../lib/progress'
import { Markdown } from './Markdown'
import { Button, Card, ProgressBar } from './ui'

/**
 * Active recall: think of the answer first, then reveal and grade yourself honestly.
 * Cards you didn't know go to the back of the queue and come again in this session.
 */
export function FlashcardSession({ cards, showChapter = false }: { cards: WithChapter<Flashcard>[]; showChapter?: boolean }) {
  const [queue, setQueue] = useState(cards)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(0)
  const [knewCount, setKnewCount] = useState(0)

  useEffect(() => {
    setQueue(cards)
    setDone(0)
    setKnewCount(0)
    setRevealed(false)
    // Only restart when the set of cards changes, not on every progress update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.map((c) => c.key).join()])

  const current = queue[0]

  const grade = (knew: boolean) => {
    gradeCard(current.key, knew)
    setRevealed(false)
    if (knew) {
      setDone((d) => d + 1)
      setKnewCount((k) => k + 1)
      setQueue((q) => q.slice(1))
    } else {
      setQueue((q) => [...q.slice(1), q[0]])
      setDone((d) => d + 1)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current || (e.target as HTMLElement).closest('input, textarea, .cm-editor')) return
      if (e.key === ' ' && !revealed) {
        e.preventDefault()
        setRevealed(true)
      } else if (revealed && (e.key === '1' || e.key === 'ArrowLeft')) grade(false)
      else if (revealed && (e.key === '2' || e.key === 'ArrowRight')) grade(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (cards.length === 0) {
    return <Card className="text-center text-zinc-400">Keine Karten vorhanden.</Card>
  }

  if (!current) {
    return (
      <Card className="py-10 text-center">
        <div className="text-5xl">🎉</div>
        <div className="mt-3 text-xl font-semibold">Session abgeschlossen</div>
        <p className="mt-1 text-zinc-400">
          {cards.length} Karten · {knewCount} Mal gewusst · {done - knewCount} Mal wiederholt
        </p>
        <Button className="mt-5" onClick={() => setQueue(cards)}>
          Nochmal durchgehen
        </Button>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <span>{queue.length} übrig</span>
        <ProgressBar value={cards.length - queue.length} max={cards.length} />
      </div>
      <Card key={current.key + String(revealed)} className="flip-enter min-h-72">
        {showChapter && (
          <Link to={`/chapter/${current.chapter.id}`} className="text-xs text-orange-400 hover:underline">
            {current.chapter.id} · {current.chapter.title}
          </Link>
        )}
        <Markdown className="mt-2 text-lg">{current.item.front}</Markdown>
        {revealed && (
          <div className="mt-6 border-t border-zinc-800 pt-5">
            <Markdown>{current.item.back}</Markdown>
          </div>
        )}
      </Card>
      <div className="flex justify-center gap-3">
        {!revealed ? (
          <Button variant="primary" className="w-64" onClick={() => setRevealed(true)}>
            Antwort zeigen <kbd className="text-xs opacity-60">Space</kbd>
          </Button>
        ) : (
          <>
            <Button variant="danger" className="w-48" onClick={() => grade(false)}>
              Nicht gewusst <kbd className="text-xs opacity-60">1</kbd>
            </Button>
            <Button variant="success" className="w-48" onClick={() => grade(true)}>
              Gewusst <kbd className="text-xs opacity-60">2</kbd>
            </Button>
          </>
        )}
      </div>
      <p className="text-center text-xs text-zinc-600">Erst laut oder im Kopf beantworten – dann aufdecken. Ehrlich bewerten.</p>
    </div>
  )
}
