// Basic usage
// Run with `mocha mocha-leaky.js`

import Memstat from '../../../index.js'

const memstat = Memstat()

function leakyFunction(leak) {
  leak+= JSON.stringify(Math.random().toString().repeat(300000))
}

import Memstat from 'memstat'

const memstat = Memstat()

// run a potentially leaky function 200 times
for (let i = 0; i < 200; i++)
  await memstat.sample(() => leakyFunction('leak'))

const usage = await memstat.end()

 // print the allocation timeline plot
console.log(usage.plot)

// print memory usage stats (in bytes)
console.log(usage)

/*
  {
    initial: 4571944,
    current: 19229872,
    percentageIncrease: 320,
    snapshots: [19229872, 22245871, 32186573, ....]
  }
*/
