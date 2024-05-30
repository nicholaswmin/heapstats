import { Readable } from 'node:stream'

let leak = []

export default function (num1, num2) {
  return new Promise(resolve => {
    const stream = new Readable({
      objectMode: true,
      read() {
        setTimeout(() =>
          this.push({ foo: Math.random().toString().repeat(350 * 100) }), 5)
      }
    })

    stream.on('data', data => {
      if (leak.length > 100) {
        stream.destroy()

        setTimeout(() => resolve(num1 + num2), 0)
      }

      leak.push(JSON.stringify(data))
    })
  })
}
