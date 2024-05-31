import chai from 'chai'

import Heapstats from '../../index.js'

chai.should()

const mbToBytes = mb => Math.ceil(mb * 1024 * 1024)

describe('#sample()', function() {
  this.slow(500)

  beforeEach('setup heapstats', function() {
    this.heapstats = Heapstats()
    this.nonLeakyFunction = function(a, b) {
      return new Promise(res =>
        setTimeout(() => res(a + b), 10))
    }

    global.gc()
  })

  describe ('against a non-leaky function', function() {
    it ('returns the result of the function', async function() {
      const res = await this.heapstats.sample(() => this.nonLeakyFunction(2, 3))

      res.should.be.a('Number').equal(5)
    })

    it ('records a small initial heap size', async function() {
      this.heapstats = Heapstats()

      for (let i = 0; i < 5; i++)
        await this.heapstats.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.heapstats.end(this)

      usage.initial.should.be.within(mbToBytes(5), mbToBytes(15))
    })

    it('records no significant percentage increase', async function() {
      this.heapstats = Heapstats()

      for (let i = 0; i < 10; i++)
        await this.heapstats.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.heapstats.end(this)

      usage.increasePercentage.should.be.within(-5, 5)
    })

    it('records no change in heap size', async function() {
      this.heapstats = Heapstats()

      for (let i = 0; i < 10; i++)
        await this.heapstats.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.heapstats.end(this)

      usage.current.should.be.within(mbToBytes(5), mbToBytes(15))
    })
  })
})
