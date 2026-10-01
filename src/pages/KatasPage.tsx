import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { allKatas, inTrack, isTrackId, trackById } from '../content'
import { useProgress } from '../lib/progress'
import { Button, Card, LevelBadge, PageHeader } from '../components/ui'

type Filter = 'all' | 'open' | 'solved'

export function KatasPage() {
  const p = useProgress()
  const navigate = useNavigate()
  const { track = '' } = useParams()
  const [filter, setFilter] = useState<Filter>('open')
  const [level, setLevel] = useState(0)
  const [runnableOnly, setRunnableOnly] = useState(false)
  if (!isTrackId(track)) return <Navigate to="/tracks" replace />

  const trackData = trackById.get(track)!
  const base = `/t/${track}`

  const list = inTrack(allKatas, track).filter((k) => {
    const solved = p.katas[k.key]?.solved
    if (filter === 'open' && solved) return false
    if (filter === 'solved' && !solved) return false
    if (level && k.item.level !== level) return false
    if (runnableOnly && !k.item.tests) return false
    return true
  })

  const random = () => {
    const pick = list[Math.floor(Math.random() * list.length)]
    if (pick) navigate(`${base}/kata/${pick.chapter.id}/${pick.item.id}`)
  }

  return (
    <div>
      <PageHeader
        title={`${trackData.icon} Katas`}
        subtitle="Kleine Aufgaben, aus dem Kopf gelöst. Autocomplete ist bewusst aus."
        actions={
          <Button variant="primary" onClick={random} disabled={!list.length}>
            🎲 Zufalls-Kata
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        {(['open', 'solved', 'all'] as Filter[]).map((f) => (
          <Button key={f} variant={filter === f ? 'primary' : 'secondary'} onClick={() => setFilter(f)}>
            {{ open: 'Offen', solved: 'Gelöst', all: 'Alle' }[f]}
          </Button>
        ))}
        <select
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
        >
          <option value={0}>Alle Level</option>
          {[1, 2, 3, 4, 5].map((l) => (
            <option key={l} value={l}>
              Level {l}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-zinc-400">
          <input type="checkbox" checked={runnableOnly} onChange={(e) => setRunnableOnly(e.target.checked)} />
          nur mit Tests
        </label>
        <span className="ml-auto text-zinc-500">{list.length} Katas</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {list.map((k) => {
          const s = p.katas[k.key]
          return (
            <Link key={k.key} to={`${base}/kata/${k.chapter.id}/${k.item.id}`} className="min-w-0">
              <Card className="h-full p-4 transition hover:border-zinc-600">
                <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                  <span className="truncate">
                    {k.chapter.id} · {k.chapter.title}
                  </span>
                  <LevelBadge level={k.item.level} />
                </div>
                <div className="mt-2 font-semibold">{k.item.title}</div>
                <div className="mt-2 text-xs text-zinc-500">
                  {s?.solved ? '✅ gelöst' : s?.attempts ? `${s.attempts} Versuche` : 'neu'}
                  {!k.item.tests && ' · Schreiben & vergleichen'}
                </div>
              </Card>
            </Link>
          )
        })}
        {list.length === 0 && (
          <Card className="text-zinc-400">
            Keine Katas für diesen Filter. Für {trackData.label} sind {inTrack(allKatas, track).length} Katas angelegt.
          </Card>
        )}
      </div>
    </div>
  )
}
