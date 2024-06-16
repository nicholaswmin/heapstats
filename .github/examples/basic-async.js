// Basic usage example, testing an `async` leaky function
//
// Run with `node .github/examples/basic-async.js`

import Heapstats from '../../index.js'

// Sample async leaky function
const addTwoNumbers = (a, b) => {
  Array.isArray(global.leak) ?
    global.leak.push(JSON.stringify([Math.random().toString().repeat(10000)])) :
    global.leak = []

  return new Promise(resolve => setTimeout(() => resolve(a + b), 1))
}

const heap = Heapstats()

for (let i = 0; i < 200; i++)
  await heap.sample(() => addTwoNumbers(5, 3))

console.log(heap.stats().plot)
console.log('Initial:', heap.stats().initial, 'MB')
console.log('Current:', heap.stats().current, 'MB')
console.log('Maximum:', heap.stats().max, 'MB')
console.log('Increase:', heap.stats().increasePercentage, '%')
