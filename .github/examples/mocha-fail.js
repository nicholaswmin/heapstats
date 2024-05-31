// Failing tests
// Run with `mocha mocha-leaky.js --no-package --exit`

import chai from 'chai'
import Heapstat from '../../index.js'
import { leaky, clearLeaks } from '../../test/leaky.js'

chai.should()

describe('memory usage profile', function() {
  before('setup heapstat', function() {
    this.leak = []
    this.heapstat = Heapstat()
  })

  after('memory usage test tearedown', function() {
    clearLeaks()
  })

  // this test will fail
  it ('doesnt leak (this test should fail & print a plot)', async function() {
    for (let i = 0; i < 30; i++)
      this.heapstat.sample(() => leaky({ mb: 10 }))

    const usage = await this.heapstat.end(this)

    usage.increasePercentage.should.be.within(10, 20)
  })
})
