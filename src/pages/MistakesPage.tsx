import { useState } from 'react'
import { Link } from 'react-router-dom'
import { chapterById } from '../content'
import { MISTAKE_CATEGORIES, update, useProgress } from '../lib/progress'
import { Markdown } from '../components/Markdown'
import { MistakeForm } from '../components/MistakeForm'
import { Button, Card, PageHeader } from '../components/ui'

export function MistakesPage() {
  const p = useProgress()
  const [showResolved, setShowResolved] = useState(false)
  const [adding, setAdding] = useState(false)
  const list = p.mistakes.filter((m) => showResolved || !m.resolved)

  const byChapter = Object.entries(
    p.mistakes
      .filter((m) => !m.resolved)
      .reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.chapterId]: (acc[m.chapterId] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fehlerlog"
        subtitle="Falsche Quizantworten landen automatisch hier. Erledigt markieren, wenn du es sicher kannst."
        actions={
          <Button variant="primary" onClick={() => setAdding(!adding)}>
            + Eintrag
          </Button>
        }
      />
      {adding && (
        <Card>
          <MistakeForm onSaved={() => setAdding(false)} />
        </Card>
      )}
      {byChapter.length > 0 && (
        <Card>
          <div className="mb-2 text-sm font-semibold">Wiederkehrende Schwächen</div>
          <div className="flex flex-wrap gap-2">
            {byChapter.map(([id, n]) => (
              <Link
                key={id}
                to={`/chapter/${id}`}
                className="rounded-full border border-zinc-700 px-3 py-1 text-sm hover:border-orange-500"
              >
                {id} {chapterById.get(id)?.title} <span className="text-rose-400">×{n}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
      <label className="flex items-center gap-2 text-sm text-zinc-400">
        <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
        erledigte anzeigen
      </label>
      <div className="space-y-2">
        {list.map((m) => (
          <Card key={m.id} className={`p-4 ${m.resolved ? 'opacity-50' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>{m.date}</span>
                  <Link to={`/chapter/${m.chapterId}`} className="text-orange-400 hover:underline">
                    {m.chapterId} {chapterById.get(m.chapterId)?.title}
                  </Link>
                  <span>· {m.source}</span>
                  <select
                    value={m.category}
                    onChange={(e) =>
                      update((d) => {
                        const x = d.mistakes.find((y) => y.id === m.id)
                        if (x) x.category = e.target.value as typeof m.category
                      })
                    }
                    className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-xs"
                  >
                    {MISTAKE_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <Markdown className="text-sm">{m.text}</Markdown>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  onClick={() =>
                    update((d) => {
                      const x = d.mistakes.find((y) => y.id === m.id)
                      if (x) x.resolved = !x.resolved
                    })
                  }
                >
                  {m.resolved ? '↺' : '✓ erledigt'}
                </Button>
                <Button
                  variant="ghost"
                  title="Löschen"
                  onClick={() => update((d) => void (d.mistakes = d.mistakes.filter((y) => y.id !== m.id)))}
                >
                  🗑
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {list.length === 0 && <Card className="text-center text-zinc-400">Keine offenen Fehler. 💪</Card>}
      </div>
    </div>
  )
}
