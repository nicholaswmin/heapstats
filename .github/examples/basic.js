// Basic usage example, testing a synchronous leaky function
//
// Run with `node .github/examples/basic.js`

import Heapstats from '../../index.js'

// Sample synchronous leaky function
const addTwoNumbers = (a, b) => {
  Array.isArray(global.leak) ?
    global.leak.push(JSON.stringify([Math.random().toString().repeat(15000)])) :
    global.leak = []

  return a + b
}

const heap = Heapstats()

for (let i = 0; i < 200; i++)
  heap.sample(() => addTwoNumbers(5, 3))

console.log(heap.stats().plot)
console.log('Initial:', heap.stats().initial, 'MB')
console.log('Current:', heap.stats().current, 'MB')
console.log('Maximum:', heap.stats().max, 'MB')
console.log('Increase:', heap.stats().increasePercentage, '%')
