// Run in tail mode and observer a seesaw leak
// start with `node tail.js --heapstat`

import { leaky } from '../../test/leaky.js'
import Heapstat from '../../index.js'

let leak = ''
function aLeakyFunction(a, b) {
  leak += JSON.stringify([`${Math.random()}`.repeat(500000)])

  return a + b
}

const heapstat = Heapstat()

for (let i = 0; i < 20; i++)
  await heapstat.sample(() => aLeakyFunction({ mb: 1 }))

const usage = await heapstat.end()

console.log(usage.plot)
