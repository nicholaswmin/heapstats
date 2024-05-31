// Failing tests
// Run with `mocha mocha-leaky.js --no-package --exit`

import chai from 'chai'
import Memplot from '../../index.js'
import { leaky, clearLeaks } from '../../test/leaky.js'

chai.should()

describe('memory usage profile', function() {
  before('setup memplot', function() {
    this.leak = []
    this.memplot = Memplot()
  })

  after('memory usage test tearedown', function() {
    clearLeaks()
  })

  // this test will fail
  it ('doesnt leak (this test should fail & print a plot)', async function() {
    for (let i = 0; i < 30; i++)
      this.memplot.sample(() => leaky({ mb: 10 }))

    const usage = await this.memplot.end(this)

    usage.increasePercentage.should.be.within(10, 20)
  })
})
