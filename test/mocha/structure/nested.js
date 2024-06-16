// @IMPORTANT: This file is **only** meant to be run by it's
// `runner.spec.js` runner file.

import chai from 'chai'
import Heapstats from '../../../index.js'

chai.should()

function addTwoNumbersAsync(a, b) {
  return new Promise(resolve => {
    setTimeout(() => resolve(a + b), 50)
  })
}

describe ('Describe block 1', function() {
  beforeEach(function() {
    this.heap = Heapstats({ test: this })
  })

  it ('1 - passes', async function() {
    const result = await addTwoNumbersAsync(5, 3)

    result.should.equal(8)
  })

  it ('2 - passes', async function() {
    const result = await addTwoNumbersAsync(5, 3)

    result.should.equal(8)
  })

  describe('Describe block 2', function() {
    it ('2.1 - passes', async function() {
      const result = await addTwoNumbersAsync(5, 3)

      result.should.equal(8)
    })

    it ('2.2 - passes', async function() {
      const result = await addTwoNumbersAsync(5, 3)

      result.should.equal(8)
    })

    it ('2.3 - fails', async function() {
      const result = await addTwoNumbersAsync(5, 3)

      result.should.equal(10)
    })

    it ('2.4 - passes', async function() {
      const result = await addTwoNumbersAsync(5, 3)

      result.should.equal(8)
    })
  })

  it ('3 - fails', async function() {
    const result = await addTwoNumbersAsync(5, 3)

    result.should.equal(10)
  })

  it ('4 - passes', async function() {
    const result = await addTwoNumbersAsync(5, 3)

    result.should.equal(8)
  })

  it ('5 - passes', async function() {
    const result = await addTwoNumbersAsync(5, 3)

    result.should.equal(8)
  })
})
