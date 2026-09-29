import type { Plugin, Connect } from 'vite'
import { runJava, type RunRequest } from './runJava'

function middleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (req.url !== '/api/run' || req.method !== 'POST') return next()
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body) as RunRequest
        const result = await runJava(payload)
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result))
      } catch (err) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: String(err) }))
      }
    })
  }
}

/** Serves POST /api/run on the dev and preview server, executing Java with the local JDK. */
export function javaRunnerPlugin(): Plugin {
  return {
    name: 'java-runner',
    configureServer(server) {
      server.middlewares.use(middleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware())
    },
  }
}
