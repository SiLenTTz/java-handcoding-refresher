import { Link, Navigate, useParams } from 'react-router-dom'
import { hasContent, isTrackId, trackById } from '../content'
import { useProgress } from '../lib/progress'
import { streak } from '../lib/dates'
import { chapterStats, chapterStatus, newCards, recommendedChapter, trackTotals } from '../lib/stats'
import { Button, Card, PageHeader, ProgressBar, Stat, StatusBadge } from '../components/ui'

export function Dashboard() {
  const p = useProgress()
  const { track = '' } = useParams()
  if (!isTrackId(track)) return <Navigate to="/tracks" replace />

  const trackData = trackById.get(track)!
  const base = `/t/${track}`
  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Hallo' : 'Guten Abend'

  if (!hasContent(trackData)) {
    return (
      <div>
        <PageHeader
          title={`${trackData.icon} ${trackData.label}`}
          subtitle={`${greeting} – hier entsteht gerade ein Curriculum.`}
        />
        <Card className="space-y-3">
          <div className="text-lg font-semibold">Für {trackData.label} gibt es noch keine Inhalte</div>
          <p className="text-sm text-zinc-400">
            {trackData.chapters.length > 0
              ? `${trackData.chapters.length} Kapitel sind geplant, aber noch ohne Karteikarten, Quiz und Katas.`
              : 'Das Curriculum für diese Sprache ist noch nicht angelegt.'}{' '}
            Im Playground kannst du trotzdem schon {trackData.label} schreiben und ausführen.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/tracks">
              <Button variant="primary" className="w-full sm:w-auto">
                🌍 Andere Sprache wählen
              </Button>
            </Link>
            <Link to={`${base}/playground`}>
              <Button className="w-full sm:w-auto">🧪 Zum Playground</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const totals = trackTotals(p, track)
  const fresh = newCards(p, track).length
  const next = recommendedChapter(p, trackData)
  const quizScores = Object.entries(p.quiz)
    .filter(([uid]) => uid.startsWith(`${track}/`))
    .map(([, q]) => q.best)
  const avgQuiz = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : null
  const openMistakes = p.mistakes.filter((m) => !m.resolved && m.chapterId.startsWith(`${track}/`))

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${trackData.icon} ${trackData.label}`}
        subtitle={`${greeting} – Code nicht nur lesen, schreib ihn aus dem Kopf.`}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Stat label="Streak" value={`${streak(p.activeDays)}${streak(p.activeDays) > 0 ? ' 🔥' : ''}`} sub={`${p.activeDays.length} Lerntage insgesamt`} />
        <Stat label="Karten fällig" value={totals.due} sub={`${fresh} neue verfügbar · ${totals.cards} gesamt`} />
        <Stat label="Katas gelöst" value={`${totals.solved} / ${totals.katas}`} />
        <Stat label="Quiz Ø" value={avgQuiz === null ? '–' : `${avgQuiz}%`} sub={`${quizScores.length} Kapitel getestet`} />
      </div>

      {next && (
        <Card className="flex flex-wrap items-center justify-between gap-4 border-orange-900/60 bg-gradient-to-r from-orange-950/40 to-zinc-900/60">
          <div className="min-w-0">
            <div className="text-xs tracking-wide text-orange-400 uppercase">Heute dran</div>
            <div className="mt-1 text-xl font-semibold">
              {totals.due > 0 ? `${totals.due} Karten wiederholen, dann ` : ''}Kapitel {next.id} – {next.title}
            </div>
            <div className="mt-1 text-sm text-zinc-400">Lesen → Karteikarten → Quiz → Katas</div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {totals.due > 0 && (
              <Link to={`${base}/review`}>
                <Button className="w-full sm:w-auto">🧠 Wiederholen</Button>
              </Link>
            )}
            <Link to={`${base}/chapter/${next.id}`}>
              <Button variant="primary" className="w-full sm:w-auto">
                Los geht's →
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {openMistakes.length > 0 && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Offene Schwächen</h2>
            <Link to={`${base}/mistakes`} className="text-sm text-orange-400 hover:underline">
              Alle {openMistakes.length} ansehen
            </Link>
          </div>
          <ul className="space-y-1 text-sm text-zinc-400">
            {openMistakes.slice(0, 3).map((m) => (
              <li key={m.id} className="truncate">
                <span className="mr-2 font-mono text-xs text-zinc-500">{m.chapterId.split('/')[1]}</span>
                {m.text.split('\n')[0]}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {Object.entries(trackData.modules).map(([mod, label]) => (
        <section key={mod}>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">
            Modul {mod} · {label}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trackData.chapters
              .filter((c) => c.module === mod)
              .map((c) => {
                const s = chapterStats(p, c)
                return (
                  <Link key={c.uid} to={`${base}/chapter/${c.id}`} className="min-w-0">
                    <Card className="h-full p-4 transition hover:border-zinc-600 hover:bg-zinc-900">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs text-zinc-500">{c.id}</span>
                        <StatusBadge status={chapterStatus(p, c.uid)} />
                      </div>
                      <div className="mt-2 font-semibold">{c.title}</div>
                      <div className="mt-3 space-y-1.5 text-xs text-zinc-500">
                        <div className="flex justify-between">
                          <span>{s.read ? '📖 gelesen' : '📖 –'}</span>
                          <span>Quiz {s.quiz ? `${s.quiz.best}%` : '–'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16">Katas</span>
                          <ProgressBar value={s.solved} max={s.katas} color="bg-emerald-500" />
                          <span className="w-8 text-right">
                            {s.solved}/{s.katas}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-16">Karten</span>
                          <ProgressBar value={s.learnedCards} max={s.cards} color="bg-sky-500" />
                          <span className="w-8 text-right">
                            {s.learnedCards}/{s.cards}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
          </div>
        </section>
      ))}
    </div>
  )
}
