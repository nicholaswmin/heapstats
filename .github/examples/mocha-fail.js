// Failing tests
// Run with `mocha mocha-leaky.js --no-package --exit`

import chai from 'chai'
import Memstat from '../../index.js'
import { leaky, clearLeaks } from '../../test/leaky.js'

chai.should()

describe('memory usage profile', function() {
  before('setup memstat', function() {
    this.leak = []
    this.memstat = Memstat()
  })

  after('memory usage test tearedown', function() {
    clearLeaks()
  })

  // this test will fail
  it ('doesnt leak (this test should fail & print a plot)', async function() {
    for (let i = 0; i < 30; i++)
      this.memstat.sample(() => leaky({ mb: 10 }))

    const usage = await this.memstat.end(this)

    usage.increasePercentage.should.be.within(10, 20)
  })
})
