import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { chapterById, key } from '../content'
import { update, useProgress, type KataState } from '../lib/progress'
import { runJava, type RunResponse } from '../lib/api'
import { formatDuration } from '../lib/dates'
import { CodeEditor } from '../components/CodeEditor'
import { JavaBlock, Markdown } from '../components/Markdown'
import { RunResult } from '../components/RunResult'
import { MistakeForm } from '../components/MistakeForm'
import { Button, Card, LevelBadge } from '../components/ui'

const emptyState = (starter: string): KataState => ({
  code: starter,
  attempts: 0,
  solved: false,
  revealed: false,
  hintsShown: 0,
})

export function KataPage() {
  const { chapterId = '', kataId = '' } = useParams()
  const chapter = chapterById.get(chapterId)
  const kata = chapter?.content.katas.find((k) => k.id === kataId)
  if (!chapter || !kata) return <div>Kata nicht gefunden.</div>
  // Remount per kata so local editor state resets.
  return <KataView key={`${chapterId}/${kataId}`} chapterId={chapterId} kataId={kataId} />
}

function KataView({ chapterId, kataId }: { chapterId: string; kataId: string }) {
  const chapter = chapterById.get(chapterId)!
  const kata = chapter.content.katas.find((k) => k.id === kataId)!
  const kataKey = key(chapterId, kataId)
  const p = useProgress()
  const saved = p.katas[kataKey] ?? emptyState(kata.starter)
  const runnable = !!kata.tests

  const [code, setCode] = useState(saved.code)
  const [result, setResult] = useState<RunResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [started] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  const [showMistakeForm, setShowMistakeForm] = useState(false)
  const codeRef = useRef(code)
  codeRef.current = code

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const patch = useCallback(
    (fn: (s: KataState) => void, activity = true) =>
      update(
        (d) => {
          const s = d.katas[kataKey] ?? emptyState(kata.starter)
          fn(s)
          d.katas[kataKey] = s
        },
        { activity },
      ),
    [kataKey, kata.starter],
  )

  // Persist code (debounced) so nothing is lost on reload.
  useEffect(() => {
    if (code === saved.code) return
    const t = setTimeout(() => patch((s) => void (s.code = code), false), 600)
    return () => clearTimeout(t)
  }, [code, saved.code, patch])

  const run = useCallback(async () => {
    if (running) return
    setRunning(true)
    setError(null)
    try {
      const res = await runJava({ code: codeRef.current, given: kata.given, tests: kata.tests })
      setResult(res)
      const elapsed = Date.now() - started
      patch((s) => {
        s.code = codeRef.current
        s.attempts++
        if (res.ok && res.tests.length > 0) {
          s.solved = true
          s.bestTimeMs = Math.min(s.bestTimeMs ?? Infinity, elapsed)
        }
      })
    } catch (e) {
      setError(String(e))
    } finally {
      setRunning(false)
    }
  }, [running, kata.given, kata.tests, patch, started])

  const katas = chapter.content.katas
  const nextKata = katas[katas.indexOf(kata) + 1]
  const canReveal = saved.attempts > 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={`/chapter/${chapterId}?tab=katas`} className="text-sm text-orange-400 hover:underline">
            ← {chapter.id} · {chapter.title}
          </Link>
          <h1 className="mt-1 flex items-center gap-3 text-2xl font-bold">
            {kata.title} <LevelBadge level={kata.level} />
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span title="Zeit seit Start">⏱ {formatDuration(now - started)}</span>
          <span>{saved.attempts} Versuche</span>
          {saved.solved && <span className="text-emerald-400">✅ gelöst{saved.bestTimeMs ? ` (${formatDuration(saved.bestTimeMs)})` : ''}</span>}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="min-w-0 space-y-4">
          <Card>
            <Markdown>{kata.description}</Markdown>
          </Card>
          {kata.given && (
            <Card>
              <div className="mb-2 text-xs tracking-wide text-zinc-500 uppercase">Gegeben (read-only)</div>
              <JavaBlock code={kata.given} />
            </Card>
          )}
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-xs tracking-wide text-zinc-500 uppercase">
                Hints ({saved.hintsShown}/{kata.hints.length})
              </div>
              <Button
                variant="ghost"
                disabled={saved.hintsShown >= kata.hints.length}
                onClick={() => patch((s) => void (s.hintsShown = Math.min(s.hintsShown + 1, kata.hints.length)))}
              >
                💡 {saved.hintsShown === 0 ? 'Ersten Hint' : 'Nächsten Hint'}
              </Button>
            </div>
            {saved.hintsShown === 0 && <p className="mt-1 text-sm text-zinc-500">Erst selbst versuchen. Hints kommen in kleinen Schritten.</p>}
            <ol className="mt-2 space-y-2">
              {kata.hints.slice(0, saved.hintsShown).map((h, i) => (
                <li key={i} className="rounded-lg bg-zinc-950 p-3 text-sm">
                  <span className="mr-2 text-xs text-amber-400">Hint {i + 1}</span>
                  <Markdown className="inline-block">{h}</Markdown>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <CodeEditor value={code} onChange={setCode} onRun={runnable ? run : undefined} />
          <div className="flex flex-wrap items-center gap-2">
            {runnable ? (
              <Button variant="primary" onClick={run} disabled={running}>
                {running ? '⏳ Kompiliere…' : '▶ Tests ausführen'} <kbd className="text-xs opacity-60">⌘↵</kbd>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() =>
                  patch((s) => {
                    s.code = code
                    s.attempts++
                    s.revealed = true
                  })
                }
              >
                ✍️ Fertig – mit Lösung vergleichen
              </Button>
            )}
            <Button
              disabled={!canReveal}
              title={canReveal ? '' : 'Erst einen eigenen Versuch abschicken'}
              onClick={() => patch((s) => void (s.revealed = !s.revealed))}
            >
              {saved.revealed ? '🙈 Lösung verbergen' : '👀 Lösung zeigen'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm('Code auf Startzustand zurücksetzen?')) {
                  setCode(kata.starter)
                  setResult(null)
                }
              }}
            >
              ↺ Reset
            </Button>
            <Button variant="ghost" onClick={() => setShowMistakeForm(!showMistakeForm)}>
              📓 Fehler notieren
            </Button>
            {nextKata && (
              <Link to={`/kata/${chapterId}/${nextKata.id}`} className="ml-auto">
                <Button variant="ghost">Nächste Kata →</Button>
              </Link>
            )}
          </div>

          {showMistakeForm && (
            <Card>
              <MistakeForm chapterId={chapterId} source="kata" prefill={`${kata.title}: `} onSaved={() => setShowMistakeForm(false)} />
            </Card>
          )}

          <RunResult result={result} error={error} />

          {saved.revealed && (
            <Card className="border-emerald-900">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs tracking-wide text-emerald-400 uppercase">Referenzlösung</div>
                {!runnable && !saved.solved && (
                  <div className="flex gap-2">
                    <Button variant="success" onClick={() => patch((s) => void (s.solved = true))}>
                      Hab's im Wesentlichen ✓
                    </Button>
                  </div>
                )}
              </div>
              <JavaBlock code={kata.solution} />
              <p className="mt-2 text-xs text-zinc-500">
                Vergleiche Naming, API-Wahl, Edge Cases. Dann: Lösung verbergen und aus dem Kopf nochmal schreiben.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
