// A unit-testing example with MochaJS
// Run with `npx mocha mocha.spec.js`

import { expect } from 'chai'
import Heapstats from '../../index.js'

// A non-leaky function under test
const addTwoNumbers= (a, b) => new Promise(resolve => {
  setTimeout(() => resolve(a + b), 20)
})

// Same as above but leaky
global.leak = []
const addTwoNumbersLeaky = (a, b) => new Promise(resolve => {
  const timer = setInterval(() =>
    global.leak.push(
      JSON.stringify([Math.random().toString().repeat(5000)])
    ), 1)

  setTimeout(() => {
    clearInterval(timer)
    resolve(a + b)
  }, 100)
})

describe('#addTwoNumbers', function() {
  beforeEach(function() {
    this.heap = Heapstats({ test: this })
  })

  afterEach(function() {
    global.leak = []
    global.gc()
  })

  describe('asserts valid inputs', function() {
    it ('throws if passed less than 2 parameters', function() {

    })

    it ('throws if passed more than 2 parameters', function() {

    })

    it ('throws if any parameter is not a Number', function() {

    })
  })

  describe('returns correct results', function() {
    it ('returns a Number', function() {

    })

    it ('returns the result of an addition', function() {

    })
  })

  describe('does not leak memory', function() {
    it ('does not increase heap size more than 2%', async function() {
      this.heap = Heapstats({ test: this })

      await addTwoNumbersLeaky()

      expect(this.heap.stats().to.be.below(2))
    })
  })
})
