// creates a seesaw leak
// start with `node watch-mode.js`

import Memstat from '../../../index.js'

let leak = []
setInterval(() => leak = [], 1000)
setInterval(() =>
  leak.push(JSON.stringify(Math.random().toString().repeat(1000)), 20)
)

Memstat({
  watch: true,
  window: {
    columns: process.stdout.columns - 25,
    rows: process.stdout.rows - 15
  }
})
