// Conflict-free leaker
// Usage
//
// const leak = leaky({ mb: 50, timeout: 50 })
// // leaked 50 MB
//
// // Do tests
//
// // During test tear down
// clearLeaks()

import { setTimeout as sleep } from 'node:timers/promises'

const rands = []

const clearLeaks = function() {
  rands.forEach(rand => global[rand] = undefined)
}

const leaky =  async ({ mb = 1, timeout = 50, clear = true }) => {
  let rand = Math.random().toString().slice(3, 13)
  let cleared = false

  rands.push(rand)

  for (let i = 0; i < 10; i++ ) {
    global[rand] = global[rand] || []
    global[rand].push(JSON.stringify({
      val: rand.repeat((100000 / 10) * mb)
    }))

    await sleep(5) 
  }

  const _clear = () => {
    if (cleared)
      console.warn('Leak was already cleared')

    if (clear)
      global[rand] = undefined
    cleared = true

    if (gc)
    global.gc()
  }

  return new Promise(resolve => {
    setTimeout(() => {
      _clear()
      resolve()
    }, timeout)
  })
}

export { leaky, clearLeaks }
