import { setTimeout as sleep } from 'node:timers/promises'
import chai from 'chai'
import Memstat from '../../index.js'

chai.should()

describe('#record()', function ()  {
  this.slow(1500)

  describe ('against a leaky function', function() {
    before(function() {
      this.leakyFunction = function(a, b = 1) {
        return new Promise(resolve => {
          const timer = setInterval(() => {
            a += JSON.stringify(Math.random().toString().repeat(20000 * b))
          })
          setTimeout(() => clearInterval(timer), 5)
          setTimeout(() => resolve(a ** b), 10)
        })
      }
    })

    before('start, leak, get a report, leak, get another', async function() {
      this.memstat = Memstat()

      await this.memstat.record()

      this.reportA = await this.memstat.getReport()
      await sleep(50)

      let leak = ''
      for (let i = 0; i < 50; i++)
        await this.leakyFunction(leak)

      this.reportB = await this.memstat.getReport()

      await sleep(50)

      for (let i = 0; i < 50; i++)
        await this.leakyFunction(leak)

      this.reportC = await this.memstat.getReport()

      await this.memstat.stop()
    })

    it ('records the same small initial in all checkpoints', function() {
      this.reportA.initial.should.be.within(5000000, 15000000)
      this.reportB.initial.should.equal(this.reportA.initial)
      this.reportC.initial.should.equal(this.reportB.initial)
    })

    it ('records an increase in current between checkpoints', function() {
      this.reportA.current.should.be.within(
        this.reportA.initial - 1024 * 1024 * 5,
        this.reportA.initial + 1024 * 1024 * 5
      )
      this.reportB.current.should.be.within(
        this.reportB.initial - 1024 * 1024 * 2.5,
        this.reportB.initial + 1024 * 1024 * 20
      )
      this.reportC.current.should.be.within(
        this.reportC.initial - 1024 * 1024 * 1,
        this.reportC.initial + 1024 * 1024 * 30
      )
    })

    it ('records an increase in max between checkpoints', function() {
      this.reportA.current.should.be.within(
        this.reportA.initial - 1024 * 1024 * 5,
        this.reportA.initial + 1024 * 1024 * 5
      )
      this.reportB.current.should.be.within(
        this.reportB.initial - 1024 * 1024 * 2.5,
        this.reportB.initial + 1024 * 1024 * 20
      )
      this.reportC.current.should.be.within(
        this.reportC.initial - 1024 * 1024 * 1,
        this.reportC.initial + 1024 * 1024 * 40
      )
    })
  })
})
