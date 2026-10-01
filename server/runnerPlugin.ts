import type { Plugin, Connect } from 'vite'
import { availableLanguages, runCode, type RunRequest } from './runners/index'

function middleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const json = (status: number, body: unknown) => {
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    }

    if (req.url === '/api/languages' && req.method === 'GET') {
      availableLanguages().then(
        (langs) => json(200, langs),
        (err) => json(500, { error: String(err) }),
      )
      return
    }
    if (req.url !== '/api/run' || req.method !== 'POST') return next()

    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body) as RunRequest
        json(200, await runCode(payload))
      } catch (err) {
        json(500, { error: String(err) })
      }
    })
  }
}

/** Serves the code runner on the dev and preview server, using the toolchains installed locally. */
export function runnerPlugin(): Plugin {
  return {
    name: 'code-runner',
    configureServer(server) {
      server.middlewares.use(middleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware())
    },
  }
}
