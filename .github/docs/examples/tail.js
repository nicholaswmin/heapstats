// Run in tail mode and observer a seesaw leak
// start with `node tail.js --memstat`

import Memstat from '../../../index.js'
import leaker from '../../../test/leaky.js'

console.time('done')
const rand = Math.random().toString().slice(2, 10)
const timer = setInterval(() => {
  global[rand] = global[rand] || []
  global[rand].push(JSON.stringify({
    val: rand.repeat(100000 * 10)
  }))
}, 1000)

setTimeout(() => clearInterval(timer), 5000)
console.timeEnd('done')

setTimeout(() => leak.clear(), 50000000)
