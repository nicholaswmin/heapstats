import chai from 'chai'
import Memstat from '../index.js'

chai.should()

describe('#sample()', function ()  {
  this.slow(1500)

  beforeEach('setup memstat', function() {
    this.memstat = Memstat()
  })

  describe ('against a leaky function', function() {
    before(function() {
      this.leakyFunction = function(a, b) {
        return new Promise(resolve => {
          const timer = setInterval(() => {
            a += Math.random().toString().repeat(8000)
          })
          setTimeout(() => clearInterval(timer), 50)
          setTimeout(() => resolve(a ** b), 100)
        })
      }
    })

    it ('reports a small initial heap size', async function() {
      let leak = ''
      for (let i = 0; i < 5; i++)
        await this.memstat.sample(() => this.leakyFunction(leak))

      const usage = await this.memstat.end(this)

      usage.initial.should.be.within(5 * 1024 * 1024, 15 * 1024 * 1024)
    })

    it ('reports a significant increase percentage', async function() {
      let leak = ''
      for (let i = 0; i < 5; i++)
        await this.memstat.sample(() => this.leakyFunction(leak))

      const usage = await this.memstat.end(this)

      usage.percentageIncrease.should.be.within(50, 150)
    })

    it ('reports a significantly higher current heap size', async function() {
      let leak = ''

      for (let i = 0; i < 5; i++)
        await this.memstat.sample(() => this.leakyFunction(leak))

      const usage = await this.memstat.end(this)

      usage.current.should.be.within(14 * 1024 * 1024, 50 * 1024 * 1024)
    })
  })
})
