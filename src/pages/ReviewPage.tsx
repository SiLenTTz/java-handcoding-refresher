import { useState } from 'react'
import { Link } from 'react-router-dom'
import { allFlashcards } from '../content'
import { useProgress } from '../lib/progress'
import { shuffle } from '../lib/dates'
import { dueCards, newCards } from '../lib/stats'
import { FlashcardSession } from '../components/FlashcardSession'
import { Button, Card, PageHeader } from '../components/ui'

const NEW_PER_SESSION = 15

export function ReviewPage() {
  const p = useProgress()
  const [session, setSession] = useState<typeof allFlashcards | null>(null)
  const due = dueCards(p)
  const fresh = newCards(p)
  const boxes = [0, 1, 2, 3, 4, 5].map((b) => Object.values(p.cards).filter((c) => c.box === b).length)

  if (session) {
    return (
      <div>
        <PageHeader
          title="Wiederholung"
          actions={
            <Button variant="ghost" onClick={() => setSession(null)}>
              ← Übersicht
            </Button>
          }
        />
        <FlashcardSession cards={session} showChapter />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Wiederholen" subtitle="Leitner-System: gewusst → längeres Intervall, nicht gewusst → zurück auf Box 0." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-4xl font-bold">{due.length}</div>
          <div className="text-zinc-400">Karten fällig</div>
          <Button className="mt-4 w-full" variant="primary" disabled={!due.length} onClick={() => setSession(shuffle(due))}>
            Fällige wiederholen
          </Button>
        </Card>
        <Card>
          <div className="text-4xl font-bold">{fresh.length}</div>
          <div className="text-zinc-400">Neue Karten (aus gelesenen Kapiteln)</div>
          <Button
            className="mt-4 w-full"
            disabled={!fresh.length}
            onClick={() => setSession([...shuffle(due), ...fresh.slice(0, NEW_PER_SESSION)])}
          >
            Fällige + {Math.min(NEW_PER_SESSION, fresh.length)} neue
          </Button>
        </Card>
        <Card>
          <div className="text-4xl font-bold">{allFlashcards.length}</div>
          <div className="text-zinc-400">Karten insgesamt</div>
          <Button className="mt-4 w-full" onClick={() => setSession(shuffle(allFlashcards).slice(0, 25))}>
            🎲 25 zufällige (Cram)
          </Button>
        </Card>
      </div>
      <Card>
        <div className="mb-3 text-sm font-semibold">Leitner-Boxen</div>
        <div className="flex items-end gap-3">
          {boxes.map((n, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="mx-auto flex h-24 items-end justify-center">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-orange-700 to-orange-400"
                  style={{ height: `${Math.max(4, (n / Math.max(1, ...boxes)) * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-sm font-semibold">{n}</div>
              <div className="text-xs text-zinc-500">Box {i}</div>
            </div>
          ))}
        </div>
      </Card>
      {fresh.length === 0 && due.length === 0 && (
        <Card className="text-zinc-400">
          Noch nichts zu tun. Lies ein <Link to="/" className="text-orange-400 hover:underline">Kapitel</Link> – danach tauchen seine Karten hier auf.
        </Card>
      )}
    </div>
  )
}
