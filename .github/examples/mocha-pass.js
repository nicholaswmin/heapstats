// Passing tests
// Run with `mocha mocha-leaky.js --no-package --exit`

import chai from 'chai'
import Memplot from '../../index.js'

chai.should()

function nonLeakyFunction() {
  return 'Hello World'
}

describe('memory usage profile', function() {
  beforeEach('setup memplot', function() {
    this.leak = []
    this.memplot = Memplot()
  })

  // this test will pass
  it ('does not leak memory', async function() {
    // avoid arrow functions in Mocha

    for (let i = 0; i < 30; i++)
      await this.memplot.sample(() => nonLeakyFunction())

    const usage = await this.memplot.end(this) // pass this here

    usage.increasePercentage.should.be.within(0, 5)
  })
})
