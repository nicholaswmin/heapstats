// Run in tail mode and observer a seesaw leak
// start with `node tail.js --memstat`

import { leaky } from '../../test/leaky.js'
import Memstat from '../../index.js'

let leak = ''
function aLeakyFunction(a, b) {
  leak += JSON.stringify([`${Math.random()}`.repeat(500000)])

  return a + b
}

const memstat = Memstat()

for (let i = 0; i < 20; i++)
  await memstat.sample(() => aLeakyFunction({ mb: 1 }))

const usage = await memstat.end()

console.log(usage.plot)
