// Passing tests
// Run with `mocha mocha-leaky.js --no-package --exit`

import chai from 'chai'
import Heapstat from '../../index.js'

chai.should()

function nonLeakyFunction() {
  return 'Hello World'
}

describe('memory usage profile', function() {
  beforeEach('setup heapstat', function() {
    this.leak = []
    this.heapstat = Heapstat()
  })

  // this test will pass
  it ('does not leak memory', async function() {
    // avoid arrow functions in Mocha

    for (let i = 0; i < 30; i++)
      await this.heapstat.sample(() => nonLeakyFunction())

    const usage = await this.heapstat.end(this) // pass this here

    usage.increasePercentage.should.be.within(0, 5)
  })
})
