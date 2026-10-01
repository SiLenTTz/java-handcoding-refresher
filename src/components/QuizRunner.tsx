import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { WithChapter } from '../content'
import type { QuizQuestion } from '../content/types'
import { Markdown } from './Markdown'
import { Button, Card, ProgressBar } from './ui'

export interface QuizAnswer {
  question: WithChapter<QuizQuestion>
  chosen: number
  correct: boolean
}

/** Snippet in the language of the chapter's track. */
function Snippet({ code, lang }: { code: string; lang: string }) {
  return <Markdown>{'```' + lang + '\n' + code.trim() + '\n```'}</Markdown>
}

const chapterLink = (q: WithChapter<QuizQuestion>) => `/t/${q.chapter.track.id}/chapter/${q.chapter.id}`

interface Props {
  questions: WithChapter<QuizQuestion>[]
  /** practice: explanation after each answer. exam: no feedback until the end. */
  mode: 'practice' | 'exam'
  onFinish: (answers: QuizAnswer[]) => void
  showChapter?: boolean
  /** When set to true (e.g. time is up), the quiz ends with the answers given so far. */
  forceFinish?: boolean
}

export function QuizRunner({ questions, mode, onFinish, showChapter = false, forceFinish = false }: Props) {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])

  const q = questions[index]
  const locked = mode === 'practice' && chosen !== null

  const next = () => {
    if (chosen === null) return
    const all = [...answers, { question: q, chosen, correct: chosen === q.item.correct }]
    setAnswers(all)
    setChosen(null)
    if (index + 1 < questions.length) setIndex(index + 1)
    else onFinish(all)
  }

  useEffect(() => {
    if (forceFinish) onFinish(answers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceFinish])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if (n >= 1 && n <= q.item.options.length && !locked) setChosen(n - 1)
      if (e.key === 'Enter' && chosen !== null) next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!q) return null

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <span className="whitespace-nowrap">
          Frage {index + 1} / {questions.length}
        </span>
        <ProgressBar value={index} max={questions.length} />
      </div>
      <Card>
        {showChapter && <div className="mb-2 text-xs text-orange-400">{q.chapter.id} · {q.chapter.title}</div>}
        <Markdown className="text-lg">{q.item.prompt}</Markdown>
        {q.item.code && (
          <div className="mt-3">
            <Snippet code={q.item.code} lang={q.chapter.track.codeLang} />
          </div>
        )}
        <div className="mt-5 space-y-2">
          {q.item.options.map((opt, i) => {
            const isChosen = chosen === i
            const reveal = locked
            const style = reveal
              ? i === q.item.correct
                ? 'border-emerald-600 bg-emerald-950/50'
                : isChosen
                  ? 'border-rose-600 bg-rose-950/50'
                  : 'border-zinc-800 opacity-60'
              : isChosen
                ? 'border-orange-500 bg-orange-950/30'
                : 'border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
            return (
              <button
                key={i}
                disabled={locked}
                onClick={() => setChosen(i)}
                className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition sm:px-4 ${style}`}
              >
                <span className="mt-0.5 font-mono text-xs text-zinc-500">{i + 1}</span>
                <Markdown className="prose-p:my-0 flex-1">{opt}</Markdown>
              </button>
            )
          })}
        </div>
        {locked && (
          <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-1 font-semibold">{chosen === q.item.correct ? '✅ Richtig' : '❌ Falsch'}</div>
            <Markdown>{q.item.explanation}</Markdown>
          </div>
        )}
      </Card>
      <div className="flex justify-end">
        <Button variant="primary" className="w-full py-3 sm:w-auto sm:py-2" disabled={chosen === null} onClick={next}>
          {index + 1 < questions.length ? 'Weiter' : 'Auswerten'} <kbd className="hidden text-xs opacity-60 sm:inline">↵</kbd>
        </Button>
      </div>
    </div>
  )
}

export function QuizReview({ answers }: { answers: QuizAnswer[] }) {
  const wrong = answers.filter((a) => !a.correct)
  if (wrong.length === 0) return null
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Falsch beantwortet ({wrong.length})</h3>
      {wrong.map((a) => (
        <Card key={a.question.key}>
          <Link to={chapterLink(a.question)} className="text-xs text-orange-400 hover:underline">
            {a.question.chapter.id} · {a.question.chapter.title}
          </Link>
          <Markdown className="mt-1">{a.question.item.prompt}</Markdown>
          {a.question.item.code && <Snippet code={a.question.item.code} lang={a.question.chapter.track.codeLang} />}
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div className="rounded-lg border border-rose-800 bg-rose-950/30 p-2">
              <div className="text-xs text-rose-400">Deine Antwort</div>
              <Markdown className="prose-p:my-0">{a.question.item.options[a.chosen]}</Markdown>
            </div>
            <div className="rounded-lg border border-emerald-800 bg-emerald-950/30 p-2">
              <div className="text-xs text-emerald-400">Richtig</div>
              <Markdown className="prose-p:my-0">{a.question.item.options[a.question.item.correct]}</Markdown>
            </div>
          </div>
          <div className="mt-3 text-sm text-zinc-300">
            <Markdown>{a.question.item.explanation}</Markdown>
          </div>
        </Card>
      ))}
    </div>
  )
}
