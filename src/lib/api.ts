export interface TestResult {
  name: string
  passed: boolean
  message?: string
}

export interface RunResponse {
  ok: boolean
  phase: 'compile' | 'runtime' | 'timeout' | 'done'
  stdout: string
  stderr: string
  tests: TestResult[]
  durationMs: number
}

export async function runJava(req: { code: string; given?: string; tests?: string }): Promise<RunResponse> {
  const res = await fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`Runner-Fehler (${res.status}): ${await res.text()}`)
  return res.json()
}
