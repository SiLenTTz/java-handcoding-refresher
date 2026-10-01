import { useEffect, useState } from 'react'
import { allKatas, allQuiz, inTrack, isTrackId, trackById } from '../content'
import { addMistake, update, useProgress } from '../lib/progress'
import { formatDuration, shuffle } from '../lib/dates'
import { QuizReview, QuizRunner, type QuizAnswer } from '../components/QuizRunner'
import { Button, Card, PageHeader } from '../components/ui'
import { Link, Navigate, useParams } from 'react-router-dom'

interface ExamSession {
  questions: typeof allQuiz
  startedAt: number
  deadline: number
}

export function ExamPage() {
  const p = useProgress()
  const { track = '' } = useParams()
  const [count, setCount] = useState(30)
  const [scope, setScope] = useState('all')
  const [session, setSession] = useState<ExamSession | null>(null)
  const [answers, setAnswers] = useState<QuizAnswer[] | null>(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!session || answers) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [session, answers])

  // Modules differ per track, so a scope from another language would empty the pool.
  useEffect(() => {
    setScope('all')
    setSession(null)
    setAnswers(null)
  }, [track])

  if (!isTrackId(track)) return <Navigate to="/tracks" replace />

  const trackData = trackById.get(track)!
  const base = `/t/${track}`
  const pool = inTrack(allQuiz, track).filter((q) => scope === 'all' || q.chapter.module === scope)

  const start = () => {
    const questions = shuffle(pool).slice(0, count)
    const startedAt = Date.now()
    setAnswers(null)
    setNow(startedAt)
    setSession({ questions, startedAt, deadline: startedAt + questions.length * 60_000 })
  }

  const finish = (given: QuizAnswer[]) => {
    if (!session) return
    const correct = given.filter((a) => a.correct).length
    update((d) =>
      void d.exams.unshift({
        date: new Date().toISOString(),
        score: correct,
        total: session.questions.length,
        durationMs: Date.now() - session.startedAt,
        track,
      }),
    )
    given
      .filter((a) => !a.correct)
      .forEach((a) =>
        addMistake({
          chapterId: a.question.chapter.uid,
          category: 'CONCEPT',
          source: 'exam',
          text: a.question.item.prompt.split('\n')[0],
        }),
      )
    setAnswers(given)
  }

  if (session && answers) {
    const total = session.questions.length
    const correct = answers.filter((a) => a.correct).length
    const pct = Math.round((correct / total) * 100)
    const byChapter = trackData.chapters
      .map((c) => {
        const qs = answers.filter((a) => a.question.chapter.uid === c.uid)
        return { c, n: qs.length, ok: qs.filter((a) => a.correct).length }
      })
      .filter((x) => x.n > 0)
      .sort((a, b) => a.ok / a.n - b.ok / b.n)
    const grade = pct >= 90 ? 'sehr sicher' : pct >= 80 ? 'sicher' : pct >= 70 ? 'brauchbar' : pct >= 60 ? 'wiederholen' : 'Kapitel erneut lernen'

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="text-center">
          <div className="text-xs tracking-wide text-zinc-500 uppercase">
            Prüfungsergebnis · {trackData.icon} {trackData.label}
          </div>
          <div className="mt-2 text-6xl font-bold">{pct}%</div>
          <div className="mt-1 text-zinc-400">
            {correct}/{total} richtig · {answers.length < total && `${total - answers.length} unbeantwortet · `}
            {formatDuration(Date.now() - session.startedAt)} · {grade}
          </div>
          <Button className="mt-5 w-full sm:w-auto" variant="primary" onClick={() => setSession(null)}>
            Neue Prüfung
          </Button>
        </Card>
        <Card>
          <div className="mb-3 font-semibold">Nach Kapitel (schwächste zuerst)</div>
          <div className="space-y-1.5 text-sm">
            {byChapter.map(({ c, n, ok }) => (
              <Link key={c.uid} to={`${base}/chapter/${c.id}`} className="flex items-center gap-3 hover:text-orange-300">
                <span className="w-8 font-mono text-xs text-zinc-500">{c.id}</span>
                <span className="min-w-0 flex-1 truncate">{c.title}</span>
                <span className={ok === n ? 'text-emerald-400' : ok / n < 0.6 ? 'text-rose-400' : 'text-amber-400'}>
                  {ok}/{n}
                </span>
              </Link>
            ))}
          </div>
        </Card>
        <QuizReview answers={answers} />
      </div>
    )
  }

  if (session) {
    const left = session.deadline - now
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">🎓 Prüfungsmodus</h1>
          <div className={`font-mono text-lg ${left < 60_000 ? 'text-rose-400' : 'text-zinc-300'}`}>⏱ {formatDuration(Math.max(0, left))}</div>
        </div>
        <QuizRunner questions={session.questions} mode="exam" onFinish={finish} showChapter forceFinish={left <= 0} />
      </div>
    )
  }

  const hardKatas = inTrack(allKatas, track).filter((k) => k.item.tests && k.item.level >= 4)
  const exams = p.exams.filter((e) => (e.track ?? 'java') === track)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${trackData.icon} Prüfung`}
        subtitle="Kein Feedback während der Prüfung, keine Hints. 1 Minute pro Frage."
      />
      <Card className="space-y-4">
        <div>
          <div className="mb-2 text-sm text-zinc-400">Umfang</div>
          <div className="flex flex-wrap gap-2">
            <Button variant={scope === 'all' ? 'primary' : 'secondary'} onClick={() => setScope('all')}>
              Alles
            </Button>
            {Object.entries(trackData.modules).map(([mod, label]) => (
              <Button key={mod} variant={scope === mod ? 'primary' : 'secondary'} onClick={() => setScope(mod)}>
                {mod} · {label}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm text-zinc-400">Anzahl Fragen (Pool: {pool.length})</div>
          <div className="flex gap-2">
            {[10, 20, 30, 50].map((n) => (
              <Button key={n} variant={count === n ? 'primary' : 'secondary'} onClick={() => setCount(n)}>
                {n}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="primary" className="w-full py-3 text-base" disabled={!pool.length} onClick={start}>
          {pool.length
            ? `Prüfung starten (${Math.min(count, pool.length)} Fragen · ${Math.min(count, pool.length)} min)`
            : `Für ${trackData.label} gibt es noch keine Quizfragen`}
        </Button>
      </Card>

      {hardKatas.length > 0 && (
        <Card>
          <div className="font-semibold">⌨️ Handcoding-Teil</div>
          <p className="mt-1 text-sm text-zinc-400">
            Für den praktischen Teil: löse 3 Katas ab Level 4 ohne Hints und ohne Lösung anzuschauen. Ziel: je unter 15 Minuten.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {shuffle(hardKatas)
              .slice(0, 3)
              .map((k) => (
                <Link key={k.key} to={`${base}/kata/${k.chapter.id}/${k.item.id}`}>
                  <Button>
                    {k.chapter.id} · {k.item.title}
                  </Button>
                </Link>
              ))}
          </div>
        </Card>
      )}

      {exams.length > 0 && (
        <Card>
          <div className="mb-2 font-semibold">Bisherige Prüfungen</div>
          <table className="w-full text-sm">
            <tbody>
              {exams.slice(0, 10).map((e, i) => (
                <tr key={i} className="border-t border-zinc-800">
                  <td className="py-1.5 text-zinc-400">{new Date(e.date).toLocaleString('de-DE')}</td>
                  <td>
                    {e.score}/{e.total}
                  </td>
                  <td className="font-semibold">{Math.round((e.score / e.total) * 100)}%</td>
                  <td className="text-zinc-500">{formatDuration(e.durationMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
