import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { hasContent, tracks } from '../content'
import { fetchAvailableLanguages } from '../lib/api'
import { useProgress } from '../lib/progress'
import { trackTotals } from '../lib/stats'
import { Card, PageHeader, ProgressBar } from '../components/ui'
import type { TrackId } from '../content/tracks'

export function TracksPage() {
  const p = useProgress()
  const [available, setAvailable] = useState<Record<TrackId, boolean> | null>(null)

  useEffect(() => {
    fetchAvailableLanguages().then(setAvailable, () => setAvailable(null))
  }, [])

  return (
    <div>
      <PageHeader
        title="Sprachen"
        subtitle="Jede Sprache hat ihr eigenes Curriculum, eigene Karteikarten und Katas, die lokal ausgeführt werden."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((t) => {
          const totals = trackTotals(p, t.id)
          const ready = hasContent(t)
          const runner = available?.[t.id]
          return (
            <Link key={t.id} to={`/t/${t.id}`}>
              <Card className="h-full transition hover:border-zinc-600 hover:bg-zinc-900">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-lg font-semibold">{t.label}</span>
                  </div>
                  {!t.runnable ? (
                    <span className="rounded-md border border-sky-800 bg-sky-950 px-2 py-0.5 text-[11px] text-sky-300">
                      Schreiben &amp; vergleichen
                    </span>
                  ) : (
                    runner === false && (
                      <span className="rounded-md border border-amber-800 bg-amber-950 px-2 py-0.5 text-[11px] text-amber-300">
                        kein Runner
                      </span>
                    )
                  )}
                </div>
                <p className="mt-2 text-sm text-zinc-400">{t.blurb}</p>
                {ready ? (
                  <div className="mt-4 space-y-1.5 text-xs text-zinc-500">
                    <div className="flex justify-between">
                      <span>{t.chapters.length} Kapitel</span>
                      <span>
                        {totals.cards} Karten · {totals.katas} Katas
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16">Katas</span>
                      <ProgressBar value={totals.solved} max={totals.katas} color="bg-emerald-500" />
                      <span className="w-12 text-right">
                        {totals.solved}/{totals.katas}
                      </span>
                    </div>
                    {totals.due > 0 && <div className="text-orange-400">{totals.due} Karten fällig</div>}
                  </div>
                ) : (
                  <div className="mt-4 text-xs text-zinc-500">
                    {t.chapters.length} Kapitel geplant · Inhalte folgen
                  </div>
                )}
              </Card>
            </Link>
          )
        })}
      </div>
      {available && tracks.some((t) => t.runnable && available[t.id] === false) && (
        <Card className="mt-6 text-sm text-zinc-400">
          Für Sprachen ohne Runner fehlt die Toolchain auf diesem Rechner. Katas lassen sich dann schreiben und mit der
          Lösung vergleichen, aber nicht ausführen.
        </Card>
      )}
      <Card className="mt-3 text-sm text-zinc-400">
        SPS-Sprachen (SCL, AWL, FUP, KOP) haben keinen lokalen Compiler – FUP und KOP sind zudem grafisch. Diese Katas
        schreibst du von Hand und vergleichst sie anschließend mit der Musterlösung.
      </Card>
    </div>
  )
}
