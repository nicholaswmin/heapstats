// Run in tail mode and observer a seesaw leak
// start with `node tail.js --heapstats`

import leaky from '../../test/leaky.js'
import Heapstats from '../../index.js'

let leak = {}

const heap = Heapstats()

for (let i = 0; i < 50; i++)
  await leaky({ leak, mb: 5, log: true })

const stats = await heap.stats()

console.log(stats)
