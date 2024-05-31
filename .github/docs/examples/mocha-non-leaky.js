// Passing tests
// Run with `mocha mocha-non-leaky.js`

import chai from 'chai'
import Memstat from '../../../index.js'

chai.should()

function nonLeakyFunction() {
  return 'Hello World'
}

describe('memory usage profile', function() {
  beforeEach('setup memstat', function() {
    this.leak = []
    this.memstat = Memstat()
  })

  // this test will pass
  it ('does not leak memory', async function() {
    // avoid arrow functions in Mocha

    for (let i = 0; i < 30; i++)
      await this.memstat.sample(() => nonLeakyFunction())

    const usage = await this.memstat.end(this) // pass this here

    usage.percentageIncrease.should.be.within(0, 5)
  })
})
