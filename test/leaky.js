// Conflict-free, non-blocking, memory leaks
//
// ## Usage
//
// Provide the leak target externally, as an argument:
//
// ```js
// import leaky from 'leaky'
//
// const leak = {}
// await leaky({ leak, mb: 50, timeout: 50 })
// // leaked 50 MB
//
// // do stuff...
//
// // dont forget to clear it when done ...
// leak = undefined
// global.gc()
// ```

import { setTimeout as sleep } from 'node:timers/promises'
import { styleText as style } from 'node:util'

export default async ({ leak, mb = 1, log = false }) => {
  const rand = Math.random().toString().slice(3, 13)

  if (log) {
    const leaksizeMB = Math.round(
      new Blob([JSON.stringify(leak)]).size / 1000 / 1000
    )

    console.log(
      style('gray', 'Leaked:'),
      style('yellow', `${mb} MB`),
      style('gray', '| Total leak:'),
      style('yellow', `${leaksizeMB} MB`)
    )
  }

  for (let i = 0; i < 10; i++ ) {
    leak[rand] = leak[rand] || []
    leak[rand].push(JSON.stringify({
      val: rand.repeat((100000 / 10) * mb)
    }))

    await sleep(5)
  }

  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 100)
  })
}
