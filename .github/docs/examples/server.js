// Run `node server.js`
//
// and in another window: `curl localhost:5033`
//
import { setTimeout as sleep } from 'node:timers/promises'
import http from 'node:http'

import Memstat from '../../../index.js'
import { leaky } from '../../../test/leaky.js'

const server = http.createServer(async (req, res) => {
  const memstat = Memstat()

  if (req.url === '/') {

    for (let i = 0; i < 10; i++)
      leaky({ mb: 10 })

    await sleep(250)

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write('<html><body><p>Hello World</p></body></html>')

    const usage = await memstat.end()

    console.log(usage.plot)

    return res.end()
  }

  res.writeHead(404, { 'Content-Type': 'text/html' })
  res.write('<html><body><p>Oops 404..</p></body></html>')
})

server.listen(process.env.PORT || 5033)
console.log('Listening...')
