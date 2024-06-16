// A unit-testing example with MochaJS
// Run with `npx mocha .github/examples/mocha.spec.js --no-package`
// Should have "2 passing" and "2 failing" tests

import { expect } from 'chai'
import Heapstats from '../../index.js'

const addTwoNumbers = (a, b) => {
  Array.isArray(global.leak) ?
    global.leak.push(JSON.stringify([Math.random().toString().repeat(10000)])) :
    global.leak = []

  return new Promise(resolve => setTimeout(() => resolve(a + b), 1))
}

describe('#addTwoNumbers()', function() {
  it ('adds 2 numbers', async function() {
    const result = await addTwoNumbers(2, 3)

    expect(result).to.be.a('Number').equal(5)
  })

  describe('when run 200 times', function() {
    beforeEach(async function() {
      this.heap = Heapstats({ test: this })

      for (let i = 0; i < 200; i++)
        await this.heap.sample(() => addTwoNumbers(5, 3))
    })

    it ('does not leak memory', function() {
      expect(this.heap.stats().current).to.be.below(10)
    })

    it ('does not exceed 100 MB in memory usage', function() {
      expect(this.heap.stats().max).to.be.below(100)
    })

    it ('has not increased by more than 2%', function() {
      expect(this.heap.stats().increasePercentage).to.be.below(2)
    })
  })

  // ... and so on ...
})
