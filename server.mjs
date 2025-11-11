import http from 'node:http'
import { Readable } from 'node:stream'

const HOST = process.env.HOST ?? '0.0.0.0'
const PORT = Number(process.env.PORT ?? 3000)

const serverEntryPromise = import('./.output/server/server.js').catch((error) => {
  console.error(
    'Failed to load built server. Run `npm run build` before starting the production server.',
  )
  console.error(error)
  process.exit(1)
})

const hasBody = (method = 'GET') => !['GET', 'HEAD'].includes(method.toUpperCase())

const server = http.createServer(async (req, res) => {
  try {
    const protocol = req.socket.encrypted ? 'https' : 'http'
    const host = req.headers.host ?? `localhost:${PORT}`
    const requestUrl = new URL(req.url ?? '/', `${protocol}://${host}`)

    const requestInit = {
      method: req.method,
      headers: req.headers,
    }

    if (hasBody(req.method)) {
      Object.assign(requestInit, { body: req, duplex: 'half' })
    }

    const request = new Request(requestUrl, requestInit)
    const serverEntry = await serverEntryPromise
    const response = await serverEntry.default.fetch(request)

    res.statusCode = response.status
    res.statusMessage = response.statusText
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })

    if (!response.body) {
      res.end()
      return
    }

    if (typeof Readable.fromWeb === 'function' && response.body.getReader) {
      Readable.fromWeb(response.body).pipe(res)
    } else {
      const buffer = Buffer.from(await response.arrayBuffer())
      res.end(buffer)
    }
  } catch (error) {
    console.error(error)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

server.listen(PORT, HOST, () => {
  const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST
  console.log(`✅ TanStack Start server ready at http://${displayHost}:${PORT}`)
})
