// Failing tests
// Run with `mocha mocha-leaky.js`

import chai from 'chai'
import Memstat from '../../../index.js'
import leaky from '../../test/leaky.js'

chai.should()

function leakyFunction(leak) {
  leak+= JSON.stringify(Math.random().toString().repeat(300000))
}

describe('memory usage profile', function() {
  beforeEach('setup memstat', function() {
    this.leak = []
    this.memstat = Memstat()
  })

  // this test will fail
  it ('does leak memory', async function() {
    for (let i = 0; i < 30; i++)
      await this.memstat.sample(() => leaker({ mbPerSecond: 1 }))

    const usage = await this.memstat.end(this)

    usage.percentageIncrease.should.be.within(10, 20)
  })
})
