// Basic usage
// Run with `mocha mocha-leaky.js`

import Memstat from '../../../index.js'
import leaker from './leaker.js'

const memstat = Memstat()

// run a potentially leaky function 200 times
for (let i = 0; i < 3; i++)
  await memstat.sample(() => leaker({ mbPerSecond: 10 }))

const usage = await memstat.end()

const {
  percentageIncrease,
  snapshots,
  plot,

  initial,
  current,
  min,
  max } = usage

 // print the allocation timeline plot
console.log(plot)

// print max memory usage stats (in bytes)
console.log(max / 1024 / 1024)

/*
  {
    initial: 4571944,
    current: 19229872,
    percentageIncrease: 320,
    snapshots: [19229872, 22245871, 32186573, ....]
  }
*/
