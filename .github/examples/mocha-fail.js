// Failing tests
// Run with `mocha mocha-leaky.js --no-package --exit`

import chai from 'chai'
import Heapstats from '../../index.js'
import leaky from '../../test/leaky.js'

chai.should()
describe('Testing', function() {
  beforeEach('operation 1', function() {
    this.leak = []
    this.heap = Heapstats({ test: this })
    this.aLeakyFunction = function() { }
  })

  it ('passes 1', async function() {
    (true).should.equal(true)
  })

  it ('fails 2', async function() {
    (true).should.equal(false)
  })

  it ('passes 3', async function() {
    (true).should.equal(true)
  })

  describe('some other op', function() {
    it ('passes 4.1', async function() {
      (3).should.equal(1)
    })

    it ('fails 4.2', async function() {
      this.heap = Heapstats({ test: this })

      for (let i = 0; i < 5; i++)
        await this.aLeakyFunction({ mb: 10 });

      ;(1).should.equal(3)
    })

    it ('passes 4.3', async function() {
      (3).should.equal(3)
    })
  })

  it ('passes 4', async function() {
    (true).should.equal(true)
  })
})
