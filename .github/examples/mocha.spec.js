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

  // should pass
  it('returns correct addition result', async function() {
    const result = await addTwoNumbers(10, 20)
    expect(result).to.equal(30)
  })

  // should pass
  it('does not leak memory', async function() {
    const result = await addTwoNumbers(10, 20)
    expect(this.heap.stats().increasePercentage).to.be.below(5)
  })
})

describe('#addTwoNumbersLeaky', function() {
  beforeEach(function() {
    this.heap = Heapstats({ test: this })
  })

  afterEach(function() {
    global.leak = []
    global.gc()
  })

  // should pass
  it('returns correct addition result', async function() {
    const result = await addTwoNumbers(10, 20)
    expect(result).to.equal(30)
  })

  // should fail
  it('does not leak memory', async function() {
    const result = await addTwoNumbersLeaky(10, 20)
    expect(this.heap.stats().increasePercentage).to.be.below(5)
  })
})
