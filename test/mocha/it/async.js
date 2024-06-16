// @IMPORTANT: This file is **only** meant to be run by it's
// `runner.spec.js` runner file.

import { setTimeout } from 'node:timers/promises'
import chai from 'chai'
import Heapstats from '../../../index.js'

chai.should()

async function addTwoNumbersAsync(a, b) {
  await setTimeout(10)

  return a + b
}

describe ('Describe block level 1', function() {
  it ('1 - passes', async function() {
    this.heap = Heapstats({ test: this })

    const result = await addTwoNumbersAsync(5, 3)

    result.should.equal(8)
  })

  it ('2 - passes', async function() {
    this.heap = Heapstats({ test: this })

    const result = await addTwoNumbersAsync(5, 3)

    result.should.equal(8)
  })

  it ('3 - fails', async function() {
    this.heap = Heapstats({ test: this })

    const result = await addTwoNumbersAsync(5, 3)

    result.should.equal(10)
  })
})
