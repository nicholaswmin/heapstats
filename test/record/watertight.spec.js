import { setTimeout as sleep } from 'node:timers/promises'
import chai from 'chai'
import Memstat from '../../index.js'

chai.should()

describe('#record()', function ()  {
  this.slow(1500)

  describe ('against a non-leaky function', function() {
    before(function() {
      this.nonLeakyFunction = function(a, b) {
        return new Promise(res =>
          setTimeout(() => res(a + b), 10))
      }
    })

    before('start, leak, get a report, leak, get another', async function() {
      this.memstat = Memstat()

      await this.memstat.record()

      this.reportA = await this.memstat.getStats()
      await sleep(50)

      let leak = ''
      for (let i = 0; i < 50; i++)
        await this.nonLeakyFunction()

      this.reportB = await this.memstat.getStats()

      await sleep(50)

      for (let i = 0; i < 50; i++)
        await this.nonLeakyFunction()

      this.reportC = await this.memstat.getStats()

      await this.memstat.stop()
    })

    it ('records the same small initial in all checkpoints', function() {
      this.reportA.initial.should.be.within(
        this.reportA.initial - 1024 * 1024 * 5,
        this.reportA.initial + 1024 * 1024 * 5
      )
      this.reportB.initial.should.be.within(
        this.reportB.initial - 1024 * 1024 * 5,
        this.reportB.initial + 1024 * 1024 * 5
      )
      this.reportC.initial.should.be.within(
        this.reportC.initial - 1024 * 1024 * 5,
        this.reportC.initial + 1024 * 1024 * 5
      )
    })

    it('records small increases in current between checkpoints', function() {
      this.reportA.current.should.be.within(
        this.reportA.initial - 1024 * 1024 * 5,
        this.reportA.initial + 1024 * 1024 * 5
      )
      this.reportB.current.should.be.within(
        this.reportB.initial - 1024 * 1024 * 5,
        this.reportB.initial + 1024 * 1024 * 5
      )
      this.reportC.current.should.be.within(
        this.reportC.initial - 1024 * 1024 * 5,
        this.reportC.initial + 1024 * 1024 * 5
      )
    })

    it('records small increases in max between checkpoints', function() {
      this.reportB.max.should.be.within(
        this.reportA.max - (1024 * 1024 * 2),
        this.reportA.max + (1024 * 1024 * 2)
      )

      this.reportC.max.should.be.within(
        this.reportB.max - (1024 * 1024 * 2),
        this.reportB.max + (1024 * 1024 * 2)
      )
    })
  })
})
