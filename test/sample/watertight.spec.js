import chai from 'chai'

import Heapstats from '../../index.js'

chai.should()

describe('#sample()', function() {
  this.slow(500)

  beforeEach('setup heapstats', function() {
    this.heap = Heapstats({ test: this })
    this.nonLeakyFunction = function(a, b) {
      return new Promise(res =>
        setTimeout(() => res(a + b), 10))
    }
  })

  describe ('against a non-leaky function', function() {
    it ('returns the result of the function', async function() {
      const res = await this.heap.sample(() => this.nonLeakyFunction(2, 3))

      res.should.be.a('Number').equal(5)
    })

    it ('records a small initial heap size', async function() {
      this.heap = Heapstats({ test: this })

      for (let i = 0; i < 5; i++)
        await this.heap.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.heap.stats()

      usage.initial.should.be.within(5, 15)
    })

    it('records no significant percentage increase', async function() {
      this.heap = Heapstats({ test: this })

      for (let i = 0; i < 10; i++)
        await this.heap.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.heap.stats()

      usage.increasePercentage.should.be.within(-5, 5)
    })

    it('records no change in heap size', async function() {
      this.heap = Heapstats()

      for (let i = 0; i < 10; i++)
        await this.heap.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.heap.stats()

      usage.current.should.be.within(5, 15)
    })
  })
})
