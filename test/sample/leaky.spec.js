import chai from 'chai'

import Heapstats from '../../index.js'
import { leaky, clearLeaks } from '../leaky.js'

chai.should()

const mbToBytes = mb => Math.ceil(mb * 1024 * 1024)

describe('#sample()', function ()  {
  this.timeout(4000).slow(2500)

  describe ('against a leaky function', function() {
    before(function() {
      this.leakyFunction = leaky
    })

    after(function() {
      clearLeaks()
    })

    it ('records a small initial heap size', async function() {
      this.heapstats = Heapstats()

      for (let i = 0; i < 5; i++)
        await this.heapstats.sample(() => this.leakyFunction({ mb: 10 }))

      const usage = await this.heapstats.end(this)

      usage.initial.should.be.within(mbToBytes(5), mbToBytes(15))
    })

    it ('records a significant increase percentage', async function() {
      this.heapstats = Heapstats()

      // no await so we don't wait for it to clear
      for (let i = 0; i < 5; i++)
        await this.heapstats.sample(() => this.leakyFunction({
          mb: 10,
          clear: false
       }))

      const usage = await this.heapstats.end(this)

      usage.increasePercentage.should.be.within(300, 600)
    })

    it ('records a significantly higher current heap size', async function() {
      this.heapstats = Heapstats()

      // no await so we don't wait for it to clear
      for (let i = 0; i < 5; i++)
        await this.heapstats.sample(() => this.leakyFunction({
          mb: 10,
          clear: false
       }))

      const usage = await this.heapstats.end(this)

      usage.current.should.be.within(mbToBytes(75), mbToBytes(125))
    })
  })
})
