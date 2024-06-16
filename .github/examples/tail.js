// Run in tail mode and observer a seesaw leak
// start with `node .github/examples/tail.js --heapstats`

import Heapstats from '../../index.js'

const addTwoNumbers = (a, b) => {
  Array.isArray(global.leak) ?
    global.leak.push(JSON.stringify([Math.random().toString().repeat(10000)])) :
    global.leak = []

  return new Promise(resolve => setTimeout(() => resolve(a + b), 1))
}

setInterval(() => {
  addTwoNumbers(3, 5)
}, 50)
