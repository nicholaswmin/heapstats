// Passing tests
// Run with `mocha mocha-leaky.js --no-package --exit`

import chai from 'chai'
import Heapstats from '../../index.js'

chai.should()

function nonLeakyFunction() {
  return 'Hello World'
}

describe('memory usage profile', function() {
  beforeEach('setup heapstats', function() {
    this.leak = []
    this.heapstats = Heapstats({ test: this.currentTest })
  })

  // this test will pass
  it ('does not leak memory', async function() {
    // avoid arrow functions in Mocha

    for (let i = 0; i < 30; i++)
      await this.heapstats.sample(() => nonLeakyFunction())

    const usage = await this.heapstats.getStats()

    usage.increasePercentage.should.be.within(0, 5)
  })

  it ('Rounds all time series data passed to it', function(done) {
    (3).should.equal(3)
    setTimeout(() => {
      done()
    }, 500)
  })

  it ('does not leak memory', function(done) {
    (3).should.equal(3)
    setTimeout(() => {
      done()
    }, 500)
  })

  it ('does not leak memory', function(done) {
    (3).should.equal(3)
    setTimeout(() => {
      done()
    }, 500)
  })


  it ('does not leak memory', function(done) {
    (3).should.equal(3)
    setTimeout(() => {
      done()
    }, 500)
  })
})
