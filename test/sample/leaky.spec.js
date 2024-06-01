import chai from 'chai'

import Heapstats from '../../index.js'
import leaky from '../leaky.js'

chai.should()

describe('#sample()', function ()  {
  this.timeout(4000).slow(2500)

  describe ('against a leaky function', function() {
    before(function() {
      this.leak = {}
      this.leakyFunction = leaky
    })

    after(function() {
      this.leak = null
      global.gc()
    })

    it ('records a small initial heap size', async function() {
      this.heap = Heapstats({ test: this })

      for (let i = 0; i < 5; i++)
        await this.heap.sample(() => this.leakyFunction({
          leak: this.leak,
          mb: 10
        }))

      const usage = await this.heap.stats()

      usage.initial.should.be.within(5, 15)
    })

    it ('records a significant increase percentage', async function() {
      this.heap = Heapstats({ test: this })

      // no await so we don't wait for it to clear
      for (let i = 0; i < 5; i++)
        await this.heap.sample(() => this.leakyFunction({
          leak: this.leak,
          mb: 10
        }))

      const usage = await this.heap.stats()

      usage.increasePercentage.should.be.within(60, 120)
    })

    it ('records a significantly higher current heap size', async function() {
      this.heap = Heapstats({ test: this })

      // no await so we don't wait for it to clear
      for (let i = 0; i < 5; i++)
        await this.heap.sample(() => this.leakyFunction({
          leak: this.leak,
          mb: 10
        }))

      const usage = await this.heap.stats()

      usage.current.should.be.within(120, 180)
    })
  })
})
