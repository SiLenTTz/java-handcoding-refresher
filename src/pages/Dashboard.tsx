import { Link } from 'react-router-dom'
import { allFlashcards, allKatas, chapters } from '../content'
import { MODULES } from '../content/curriculum'
import { useProgress } from '../lib/progress'
import { streak } from '../lib/dates'
import { chapterStats, chapterStatus, dueCards, newCards, recommendedChapter, solvedKatas } from '../lib/stats'
import { Button, Card, PageHeader, ProgressBar, Stat, StatusBadge } from '../components/ui'

export function Dashboard() {
  const p = useProgress()
  const due = dueCards(p).length
  const fresh = newCards(p).length
  const next = recommendedChapter(p)
  const quizScores = Object.values(p.quiz).map((q) => q.best)
  const avgQuiz = quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : null
  const openMistakes = p.mistakes.filter((m) => !m.resolved)
  const hour = new Date().getHours()
  const greeting = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Hallo' : 'Guten Abend'

  return (
    <div className="space-y-8">
      <PageHeader title={`${greeting} 👋`} subtitle="Code nicht nur lesen – schreib ihn aus dem Kopf." />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Streak" value={`${streak(p.activeDays)}${streak(p.activeDays) > 0 ? ' 🔥' : ''}`} sub={`${p.activeDays.length} Lerntage insgesamt`} />
        <Stat label="Karten fällig" value={due} sub={`${fresh} neue verfügbar · ${allFlashcards.length} gesamt`} />
        <Stat label="Katas gelöst" value={`${solvedKatas(p)} / ${allKatas.length}`} />
        <Stat label="Quiz Ø" value={avgQuiz === null ? '–' : `${avgQuiz}%`} sub={`${quizScores.length} Kapitel getestet`} />
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4 border-orange-900/60 bg-gradient-to-r from-orange-950/40 to-zinc-900/60">
        <div>
          <div className="text-xs tracking-wide text-orange-400 uppercase">Heute dran</div>
          <div className="mt-1 text-xl font-semibold">
            {due > 0 ? `${due} Karten wiederholen, dann ` : ''}Kapitel {next.id} – {next.title}
          </div>
          <div className="mt-1 text-sm text-zinc-400">Lesen → Karteikarten → Quiz → Katas</div>
        </div>
        <div className="flex gap-2">
          {due > 0 && (
            <Link to="/review">
              <Button>🧠 Wiederholen</Button>
            </Link>
          )}
          <Link to={`/chapter/${next.id}`}>
            <Button variant="primary">Los geht's →</Button>
          </Link>
        </div>
      </Card>

      {openMistakes.length > 0 && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Offene Schwächen</h2>
            <Link to="/mistakes" className="text-sm text-orange-400 hover:underline">
              Alle {openMistakes.length} ansehen
            </Link>
          </div>
          <ul className="space-y-1 text-sm text-zinc-400">
            {openMistakes.slice(0, 3).map((m) => (
              <li key={m.id} className="truncate">
                <span className="mr-2 font-mono text-xs text-zinc-500">{m.chapterId}</span>
                {m.text.split('\n')[0]}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {(Object.keys(MODULES) as (keyof typeof MODULES)[]).map((mod) => (
        <section key={mod}>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">
            Modul {mod} · {MODULES[mod]}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {chapters
              .filter((c) => c.module === mod)
              .map((c) => {
                const s = chapterStats(p, c)
                return (
                  <Link key={c.id} to={`/chapter/${c.id}`}>
                    <Card className="h-full p-4 transition hover:border-zinc-600 hover:bg-zinc-900">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs text-zinc-500">{c.id}</span>
                        <StatusBadge status={chapterStatus(p, c.id)} />
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
