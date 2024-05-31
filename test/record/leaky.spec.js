import { setTimeout as sleep } from 'node:timers/promises'
import chai from 'chai'
import Memstat from '../../index.js'
import { leaky, clearLeaks } from '../leaky.js'

chai.should()

const mbInBytes = mb => Math.ceil(mb * 1024 * 1024)
const bytesInMb = bytes => Math.ceil(bytes / 1024 / 1024)

describe('#record()', function ()  {
  this.timeout(4000).slow(2500)

  describe ('against a leaky function', function() {
    before(function() {
      this.leakyFunction = leaky
    })

    after(function() {
      clearLeaks()
    })

    before('start, leak, get a report, leak, get another', async function() {
      this.memstat = Memstat()

      await this.memstat.record()

      this.reportA = await this.memstat.getStats()

      await sleep(50)

      for (let i = 0; i < 5; i++)
        await this.leakyFunction({ mb: 10 })

      this.reportB = await this.memstat.getStats()

      for (let i = 0; i < 5; i++)
        await this.leakyFunction({ mb: 20 })

      this.reportC = await this.memstat.getStats()

      await this.memstat.stop()
    })

    it ('records the same small initial in all checkpoints', function() {
      this.reportA.initial.should.be.within(mbInBytes(5), mbInBytes(15))
      this.reportB.initial.should.be.within(mbInBytes(5), mbInBytes(15))
      this.reportC.initial.should.be.within(mbInBytes(5), mbInBytes(15))
    })

    it ('records an increase in current between checkpoints', function() {
      this.reportA.current.should.be.within(mbInBytes(5), mbInBytes(15))
      this.reportB.current.should.be.within(mbInBytes(15), mbInBytes(25))
      this.reportC.current.should.be.within(mbInBytes(20), mbInBytes(40))
    })

    it ('records an increase in max between checkpoints', function() {
      this.reportA.max.should.be.within(mbInBytes(5), mbInBytes(15))
      this.reportB.max.should.be.within(mbInBytes(15), mbInBytes(25))
      this.reportC.max.should.be.within(mbInBytes(20), mbInBytes(40))
    })
  })
})
