// Run in tail mode and observer a seesaw leak
// start with `node tail.js --heapstats`

import leaky from '../../test/leaky.js'
import Heapstats from '../../index.js'

let leak = {}
setInterval(() => leaky({ leak: {}, mb: 10 }), 300)
