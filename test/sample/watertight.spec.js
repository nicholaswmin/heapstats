import chai from 'chai'

import Memstat from '../../index.js'

chai.should()

describe('#sample()', function() {
  this.slow(500)

  const mbInBytes = mb => Math.ceil(mb * 1024 * 1024)
  const bytesInMb = bytes => Math.ceil(bytes / 1024 / 1024)

  beforeEach('setup memstat', function() {
    this.memstat = Memstat()
    this.nonLeakyFunction = function(a, b) {
      return new Promise(res =>
        setTimeout(() => res(a + b), 10))
    }

    global.gc()
  })

  describe ('against a non-leaky function', function() {
    it ('returns a correct result', async function() {
      const res = await this.memstat.sample(() => this.nonLeakyFunction(2, 3))

      res.should.be.a('Number').equal(5)
    })

    it ('records a small initial heap size', async function() {
      this.memstat = Memstat()

      for (let i = 0; i < 5; i++)
        await this.memstat.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.memstat.end(this)

      usage.initial.should.be.within(mbInBytes(5), mbInBytes(15))
    })

    it('records no significant percentage increase', async function() {
      this.memstat = Memstat()

      for (let i = 0; i < 10; i++)
        await this.memstat.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.memstat.end(this)

      usage.increasePercentage.should.be.within(-5, 5)
    })

    it('records no change in heap size', async function() {
      this.memstat = Memstat()

      for (let i = 0; i < 10; i++)
        await this.memstat.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.memstat.end(this)

      usage.current.should.be.within(mbInBytes(5), mbInBytes(15))
    })
  })
})
