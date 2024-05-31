import { setTimeout as sleep } from 'node:timers/promises'

import chai from 'chai'
import Memstat from '../../index.js'
import { leaky, clearLeaks } from '../leaky.js'

chai.should()

describe('#sample()', function ()  {
  this.timeout(4000).slow(2500)

  const mbInBytes = mb => Math.ceil(mb * 1024 * 1024)
  const bytesInMb = bytes => Math.ceil(bytes / 1024 / 1024)

  describe ('against a leaky function', function() {
    before(function() {
      this.leakyFunction = leaky
    })

    after(function() {
      clearLeaks()
    })

    it ('records a small initial heap size', async function() {
      this.memstat = Memstat()

      for (let i = 0; i < 5; i++)
        await this.memstat.sample(() => this.leakyFunction({ mb: 10 }))

      const usage = await this.memstat.end(this)

      usage.initial.should.be.within(mbInBytes(5), mbInBytes(15))
    })

    it ('records a significant increase percentage', async function() {
      this.memstat = Memstat()

      // no await so we don't wait for it to clear
      for (let i = 0; i < 5; i++)
        await this.memstat.sample(() => this.leakyFunction({
          mb: 10,
          clear: false
       }))

      const usage = await this.memstat.end(this)

      usage.percentageIncrease.should.be.within(300, 600)
    })

    it ('records a significantly higher current heap size', async function() {
      this.memstat = Memstat()

      // no await so we don't wait for it to clear
      for (let i = 0; i < 5; i++)
        await this.memstat.sample(() => this.leakyFunction({
          mb: 10,
          clear: false
       }))

      const usage = await this.memstat.end(this)

      usage.current.should.be.within(mbInBytes(75), mbInBytes(125))
    })
  })
})
