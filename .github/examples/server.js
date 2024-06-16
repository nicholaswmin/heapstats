// Run `node .github/examples/server.js`
// then visit http://localhost:5033/
//
import http from 'node:http'

import Heapstats from '../../index.js'

const addTwoNumbers = (a, b) => {
  Array.isArray(global.leak) ?
    global.leak.push(JSON.stringify([Math.random().toString().repeat(10000)])) :
    global.leak = []

  return new Promise(resolve => setTimeout(() => resolve(a + b), 1))
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' })

      const heap = Heapstats()

      for (let i = 0; i < 100; i++) {
        await heap.sample(() => addTwoNumbers(5, 3))

        res.write(`<h4> Run leaky function ${i + 1} out of 100 times.</h4>`)
      }

      console.log(heap.stats().plot)

      res.write(`<h3> Done! You can view the heap plot in your terminal.</h3>`)

    } else {
      if (req.url.includes('favicon'))
        return res.end()

      res.writeHead(404)

      console.error('HTTP Error: 404')
    }

    res.end()
  } catch (err) {
    res.destroy(err)
    console.error('Server Error:', err)
  }
})

server.listen(process.env.PORT || 5033, () => {
  console.log('Listening!', '\n', 'Visit: http://localhost:5033/ to continue')
})
