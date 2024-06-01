// Run in tail mode and observer a seesaw leak
// start with `node tail.js --heapstats`

import { leaky } from '../../test/leaky.js'
import Heapstats from '../../index.js'

let leak = ''
function aLeakyFunction(a, b) {
  leak += JSON.stringify([`${Math.random()}`.repeat(500000)])

  return a + b
}

const heap = Heapstats()

for (let i = 0; i < 20; i++)
  await heapstats.sample(() => aLeakyFunction({ mb: 1 }))

const usage = await heap.getstatStats()

console.log(usage.plot)
