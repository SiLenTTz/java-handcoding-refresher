import { useCallback, useEffect, useRef, useState } from 'react'
import { update, useProgress } from '../lib/progress'
import { runJava, type RunResponse } from '../lib/api'
import { CodeEditor } from '../components/CodeEditor'
import { RunResult } from '../components/RunResult'
import { Button, PageHeader } from '../components/ui'

const DEFAULT = `public class Main {
    public static void main(String[] args) {
        var users = List.of(
            new User("Ada", "UK", true),
            new User("Linus", "FI", false),
            new User("Jan", "DE", true)
        );

        Map<String, List<String>> activeByCountry = users.stream()
            .filter(User::active)
            .collect(Collectors.groupingBy(User::country,
                Collectors.mapping(User::name, Collectors.toList())));

        System.out.println(activeByCountry);
    }
}

record User(String name, String country, boolean active) {}
`

export function PlaygroundPage() {
  const p = useProgress()
  const [code, setCode] = useState(p.playground || DEFAULT)
  const [result, setResult] = useState<RunResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const codeRef = useRef(code)
  codeRef.current = code

  useEffect(() => {
    const t = setTimeout(() => update((d) => void (d.playground = code), { activity: false }), 600)
    return () => clearTimeout(t)
  }, [code])

  const run = useCallback(async () => {
    setRunning(true)
    setError(null)
    try {
      setResult(await runJava({ code: codeRef.current }))
    } catch (e) {
      setError(String(e))
    } finally {
      setRunning(false)
    }
  }, [])

  return (
    <div>
      <PageHeader
        title="Playground"
        subtitle="Freies Java 21. Die erste Klasse mit main wird gestartet. java.util.*, stream, function, math, time sind importiert."
        actions={
          <>
            <Button variant="ghost" onClick={() => confirm('Beispielcode laden?') && setCode(DEFAULT)}>
              ↺ Beispiel
            </Button>
            <Button variant="primary" onClick={run} disabled={running}>
              {running ? '⏳ Läuft…' : '▶ Ausführen'} <kbd className="text-xs opacity-60">⌘↵</kbd>
            </Button>
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[3fr_2fr]">
        <CodeEditor value={code} onChange={setCode} onRun={run} minHeight="600px" />
        <div>
          <RunResult result={result} error={error} />
        </div>
      </div>
    </div>
  )
}
