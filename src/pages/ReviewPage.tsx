import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { allFlashcards, inTrack, isTrackId, trackById } from '../content'
import { useProgress } from '../lib/progress'
import { shuffle } from '../lib/dates'
import { dueCards, newCards } from '../lib/stats'
import { FlashcardSession } from '../components/FlashcardSession'
import { Button, Card, PageHeader } from '../components/ui'

const NEW_PER_SESSION = 15

export function ReviewPage() {
  const p = useProgress()
  const { track = '' } = useParams()
  const [session, setSession] = useState<typeof allFlashcards | null>(null)
  if (!isTrackId(track)) return <Navigate to="/tracks" replace />

  const trackData = trackById.get(track)!
  const cards = inTrack(allFlashcards, track)
  const due = dueCards(p, track)
  const fresh = newCards(p, track)
  const trackKeys = new Set(cards.map((c) => c.key))
  const boxes = [0, 1, 2, 3, 4, 5].map(
    (b) => Object.entries(p.cards).filter(([k, c]) => c.box === b && trackKeys.has(k)).length,
  )

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
      <PageHeader
        title={`${trackData.icon} Wiederholen`}
        subtitle="Leitner-System: gewusst → längeres Intervall, nicht gewusst → zurück auf Box 0."
      />
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
          <div className="text-4xl font-bold">{cards.length}</div>
          <div className="text-zinc-400">Karten insgesamt</div>
          <Button className="mt-4 w-full" disabled={!cards.length} onClick={() => setSession(shuffle(cards).slice(0, 25))}>
            🎲 25 zufällige (Cram)
          </Button>
        </Card>
      </div>
      <Card>
        <div className="mb-3 text-sm font-semibold">Leitner-Boxen</div>
        <div className="flex items-end gap-3">
          {boxes.map((n, i) => (
            <div key={i} className="min-w-0 flex-1 text-center">
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
          Noch nichts zu tun. Lies ein{' '}
          <Link to={`/t/${track}`} className="text-orange-400 hover:underline">
            Kapitel
          </Link>{' '}
          – danach tauchen seine Karten hier auf.
        </Card>
      )}
    </div>
  )
}
