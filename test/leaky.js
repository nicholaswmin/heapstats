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

export default async ({
  leak = {},
  mb = 1,
  timeout = 50,
  clear = false ,
  gc = true
}) => {
  const rand = Math.random().toString().slice(3, 13)

  for (let i = 0; i < 10; i++ ) {
    leak[rand] = leak[rand] || []
    leak[rand].push(JSON.stringify({
      val: rand.repeat((100000 / 10) * mb)
    }))

    await sleep(5)
  }

  const _clear = () => {
    if (clear)
      leak[rand] = undefined

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
