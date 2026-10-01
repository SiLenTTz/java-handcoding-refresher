import type { RunResponse } from '../lib/api'

export function RunResult({ result, error }: { result: RunResponse | null; error?: string | null }) {
  if (error) {
    return <pre className="rounded-lg border border-rose-800 bg-rose-950/40 p-3 text-sm whitespace-pre-wrap text-rose-200">{error}</pre>
  }
  if (!result) return null

  if (result.phase === 'unavailable') {
    return (
      <div className="space-y-2 rounded-lg border border-amber-800 bg-amber-950/40 p-3 text-sm text-amber-200">
        <div className="font-semibold">🛠️ Toolchain nicht installiert</div>
        <p className="text-amber-200/80">
          Auf diesem Rechner fehlt der Compiler bzw. die Laufzeit für diese Sprache. Installiere sie und lade die Seite
          neu – bis dahin kannst du den Code schreiben und mit der Lösung vergleichen.
        </p>
        {result.stderr && (
          <pre className="max-h-64 overflow-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs whitespace-pre-wrap text-amber-100">
            {result.stderr}
          </pre>
        )}
      </div>
    )
  }

  const passed = result.tests.filter((t) => t.passed).length
  const headline = {
    unavailable: '🛠️ Toolchain nicht installiert',
    compile: '🧱 Compile-Fehler',
    runtime: '💥 Laufzeitfehler',
    timeout: '⏱️ Timeout (Endlosschleife?)',
    done: result.tests.length ? (result.ok ? '✅ Alle Tests grün' : '❌ Tests fehlgeschlagen') : '✅ Ausgeführt',
  }[result.phase]

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{headline}</span>
        <span className="text-zinc-500">
          {result.tests.length > 0 && `${passed}/${result.tests.length} · `}
          {(result.durationMs / 1000).toFixed(1)}s
        </span>
      </div>
      {result.tests.length > 0 && (
        <ul className="space-y-1">
          {result.tests.map((t, i) => (
            <li
              key={i}
              className={`rounded px-2 py-1 font-mono text-xs ${t.passed ? 'bg-emerald-950/50 text-emerald-300' : 'bg-rose-950/50 text-rose-300'}`}
            >
              {t.passed ? '✓' : '✗'} {t.name}
              {t.message && <div className="mt-0.5 text-rose-200/80">{t.message}</div>}
            </li>
          ))}
        </ul>
      )}
      {result.stdout && (
        <div>
          <div className="mb-1 text-xs text-zinc-500">stdout</div>
          <pre className="max-h-64 overflow-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs whitespace-pre-wrap">{result.stdout}</pre>
        </div>
      )}
      {result.stderr && (
        <div>
          <div className="mb-1 text-xs text-zinc-500">stderr</div>
          <pre className="max-h-80 overflow-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs whitespace-pre-wrap text-rose-300">
            {result.stderr}
          </pre>
        </div>
      )}
    </div>
  )
}
