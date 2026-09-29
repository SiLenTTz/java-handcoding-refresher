import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { chapterById, chapters, key } from '../content'
import { MODULES } from '../content/curriculum'
import { addMistake, statusFromScore, statusRank, STATUSES, update, useProgress, type Status } from '../lib/progress'
import { chapterStatus } from '../lib/stats'
import { shuffle } from '../lib/dates'
import { Markdown } from '../components/Markdown'
import { FlashcardSession } from '../components/FlashcardSession'
import { QuizReview, QuizRunner, type QuizAnswer } from '../components/QuizRunner'
import { Button, Card, LevelBadge, StatusBadge } from '../components/ui'

const TABS = [
  { id: 'read', label: '📖 Theorie' },
  { id: 'cards', label: '🧠 Karteikarten' },
  { id: 'quiz', label: '❓ Quiz' },
  { id: 'katas', label: '⌨️ Katas' },
] as const
type Tab = (typeof TABS)[number]['id']

export function ChapterPage() {
  const { id = '01' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const p = useProgress()
  const chapter = chapterById.get(id)
  if (!chapter) return <div>Kapitel nicht gefunden.</div>

  const tab = (params.get('tab') as Tab) ?? 'read'
  const setTab = (t: Tab) => setParams({ tab: t })
  const idx = chapters.indexOf(chapter)
  const prev = chapters[idx - 1]
  const next = chapters[idx + 1]
  const status = chapterStatus(p, id)
  const { content } = chapter

  const counts: Record<Tab, number | null> = {
    read: null,
    cards: content.flashcards.length,
    quiz: content.quiz.length,
    katas: content.katas.length,
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-500">
            Modul {chapter.module} · {MODULES[chapter.module]} · Kapitel {chapter.id}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{chapter.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <select
            value={status}
            onChange={(e) => update((d) => void (d.chapterStatus[id] = e.target.value as Status))}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm"
            title="Status manuell setzen"
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap transition sm:px-4 ${tab === t.id ? 'border-orange-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}
          >
            {t.label}
            {counts[t.id] !== null && <span className="ml-1.5 text-xs text-zinc-500">{counts[t.id]}</span>}
          </button>
        ))}
      </div>

      {tab === 'read' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_200px]">
          <article className="min-w-0">
            <Markdown>{chapter.markdown}</Markdown>
            <div className="mt-10 flex justify-between border-t border-zinc-800 pt-6">
              <Button
                variant="primary"
                onClick={() => {
                  update((d) => {
                    d.chapterRead[id] = true
                    if (!d.chapterStatus[id]) d.chapterStatus[id] = 'LEARNING'
                  })
                  setTab('cards')
                  window.scrollTo(0, 0)
                }}
              >
                ✓ Gelesen – weiter zu den Karteikarten
              </Button>
            </div>
          </article>
          <Toc markdown={chapter.markdown} />
        </div>
      )}

      {tab === 'cards' && (
        <FlashcardSession cards={content.flashcards.map((item) => ({ chapter, item, key: key(id, item.id) }))} />
      )}

      {tab === 'quiz' && <ChapterQuiz chapterId={id} onDone={() => setTab('katas')} />}

      {tab === 'katas' && (
        <div className="grid gap-3 md:grid-cols-2">
          {content.katas.map((k) => {
            const s = p.katas[key(id, k.id)]
            return (
              <Link key={k.id} to={`/kata/${id}/${k.id}`}>
                <Card className="h-full transition hover:border-zinc-600">
                  <div className="flex items-center justify-between">
                    <LevelBadge level={k.level} />
                    <span className="text-xs">
                      {s?.solved ? '✅ gelöst' : s?.attempts ? `${s.attempts} Versuche` : ''}
                      {!k.tests && <span className="ml-2 text-zinc-500">Schreiben & vergleichen</span>}
                    </span>
                  </div>
                  <div className="mt-2 font-semibold">{k.title}</div>
                </Card>
              </Link>
            )
          })}
          {content.katas.length === 0 && <Card className="text-zinc-400">Noch keine Katas.</Card>}
        </div>
      )}

      <div className="mt-12 flex justify-between text-sm">
        {prev ? (
          <button onClick={() => navigate(`/chapter/${prev.id}`)} className="text-zinc-400 hover:text-white">
            ← {prev.id} {prev.title}
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button onClick={() => navigate(`/chapter/${next.id}`)} className="text-zinc-400 hover:text-white">
            {next.id} {next.title} →
          </button>
        )}
      </div>
    </div>
  )
}

function Toc({ markdown }: { markdown: string }) {
  const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1])
  if (headings.length < 3) return null
  return (
    <nav className="sticky top-8 hidden self-start text-sm lg:block">
      <div className="mb-2 text-xs tracking-wide text-zinc-500 uppercase">Inhalt</div>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h} className="truncate text-zinc-400">
            {h.replace(/`/g, '')}
          </li>
        ))}
      </ul>
    </nav>
  )
}

function ChapterQuiz({ chapterId, onDone }: { chapterId: string; onDone: () => void }) {
  const chapter = chapterById.get(chapterId)!
  const p = useProgress()
  const [run, setRun] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[] | null>(null)
  const makeQuestions = () =>
    shuffle(chapter.content.quiz).map((item) => ({ chapter, item, key: key(chapterId, item.id) }))
  const [questions, setQuestions] = useState(makeQuestions)

  if (questions.length === 0) return <Card className="text-zinc-400">Noch kein Quiz.</Card>

  const finish = (all: QuizAnswer[]) => {
    const score = Math.round((all.filter((a) => a.correct).length / all.length) * 100)
    update((d) => {
      const prev = d.quiz[chapterId]
      d.quiz[chapterId] = { best: Math.max(prev?.best ?? 0, score), last: score, date: new Date().toISOString() }
      const suggested = statusFromScore(score)
      const current = d.chapterStatus[chapterId] ?? 'UNKNOWN'
      // A new result can move the status down (honesty!) but MASTERED is only set manually.
      if (current !== 'MASTERED' || statusRank(suggested) < statusRank('OK')) d.chapterStatus[chapterId] = suggested
    })
    all
      .filter((a) => !a.correct)
      .forEach((a) =>
        addMistake({ chapterId, category: 'CONCEPT', source: 'quiz', text: a.question.item.prompt.split('\n')[0] }),
      )
    setAnswers(all)
  }

  if (answers) {
    const correct = answers.filter((a) => a.correct).length
    const score = Math.round((correct / answers.length) * 100)
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="text-center">
          <div className="text-5xl font-bold">{score}%</div>
          <div className="mt-1 text-zinc-400">
            {correct} von {answers.length} richtig · Bestwert {p.quiz[chapterId]?.best ?? score}%
          </div>
          <div className="mt-3">
            <StatusBadge status={statusFromScore(score)} />
          </div>
          <div className="mt-5 flex justify-center gap-2">
            <Button
              onClick={() => {
                setAnswers(null)
                setQuestions(makeQuestions())
                setRun(run + 1)
              }}
            >
              Nochmal
            </Button>
            <Button variant="primary" onClick={onDone}>
              Weiter zu den Katas →
            </Button>
          </div>
        </Card>
        <QuizReview answers={answers} />
      </div>
    )
  }

  return <QuizRunner key={run} questions={questions} mode="practice" onFinish={finish} />
}
