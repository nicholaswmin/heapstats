import chai from 'chai'

import Heapstats from '../../index.js'

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

    before('collect stats before each of 2 separate leaks', async function() {
      this.heap = Heapstats({ test: this })

      this.statsA = await this.heap.stats()

      let leak = ''
      for (let i = 0; i < 50; i++)
        await this.nonLeakyFunction()

      this.statsB = await this.heap.stats()

      for (let i = 0; i < 50; i++)
        await this.nonLeakyFunction()

      this.statsC = await this.heap.stats()
    })

    it ('records an equally small initial for all checkpoints', function() {
      this.statsA.initial.should.be.within(5, 15)
      this.statsB.initial.should.be.within(5, 15)
      this.statsC.initial.should.be.within(5, 15)
    })

    it('records no increases in current between checkpoints', function() {
      this.statsA.initial.should.be.within(5, 15)
      this.statsB.initial.should.be.within(5, 15)
      this.statsC.initial.should.be.within(5, 15)
    })

    it('records small increases in max between checkpoints', function() {
      this.statsA.initial.should.be.within(5, 15)
      this.statsB.initial.should.be.within(5, 15)
      this.statsC.initial.should.be.within(5, 15)
    })
  })
})
