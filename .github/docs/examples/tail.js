// creates a seesaw leak
// start with `node tail.js --memstat`

import Memstat from '../../../index.js'

let leak = []
setInterval(() => leak = [], 1000)
setInterval(() =>
  leak.push(JSON.stringify(Math.random().toString().repeat(1000)), 20)
)
