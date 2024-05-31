// Run `node server.js`
//
// and in another window: `curl localhost:5033`
//
import http from 'node:http'

import Memplot from '../../index.js'
import { leaky } from '../../test/leaky.js'

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' })

      const memplot = Memplot()

      memplot.record()

      for (let i = 0; i < 10; i++) {
        await leaky({ mb: 50, timeout: 300 })

        res.write(`<h4> Hi! I computed ${i + 1} out of 10 operations.</h4>`)
      }

      const endUsage = await memplot.end()

      console.log(endUsage.plot)

      res.write(`<h3> Done! You can view the heap plot in your terminal.</h3>`)

      return res.end()
    }

    res.writeHead(404)
    res.end()

    console.error('HTTP Error: 404')
  } catch (err) {
    res.destroy(err)
    console.error('Server Error:', err)
  }
})

server.listen(process.env.PORT || 5033, () => {
  console.log('Listening!', '\n', 'Visit: http://localhost:5033/ to continue')
})
