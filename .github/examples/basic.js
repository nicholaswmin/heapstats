// Run in tail mode and observer a seesaw leak
// start with `node tail.js --memplot`

import { leaky } from '../../test/leaky.js'
import Memplot from '../../index.js'

let leak = ''
function aLeakyFunction(a, b) {
  leak += JSON.stringify([`${Math.random()}`.repeat(500000)])

  return a + b
}

const memplot = Memplot()

for (let i = 0; i < 20; i++)
  await memplot.sample(() => aLeakyFunction({ mb: 1 }))

const usage = await memplot.end()

console.log(usage.plot)
