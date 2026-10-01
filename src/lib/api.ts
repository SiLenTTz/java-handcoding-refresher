import type { TrackId } from '../content/tracks'

export interface TestResult {
  name: string
  passed: boolean
  message?: string
}

export interface RunResponse {
  ok: boolean
  phase: 'unavailable' | 'compile' | 'runtime' | 'timeout' | 'done'
  stdout: string
  stderr: string
  tests: TestResult[]
  durationMs: number
}

export async function runCode(req: { language: TrackId; code: string; given?: string; tests?: string }): Promise<RunResponse> {
  const res = await fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`Runner-Fehler (${res.status}): ${await res.text()}`)
  return res.json()
}

/** Which toolchains are installed on the machine serving the app. */
export async function fetchAvailableLanguages(): Promise<Record<TrackId, boolean>> {
  const res = await fetch('/api/languages')
  if (!res.ok) throw new Error(`Runner-Fehler (${res.status})`)
  return res.json()
}
