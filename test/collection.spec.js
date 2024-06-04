import chai from 'chai'

import Heapstats from '../index.js'
import leaky from './leaky.js'

chai.should()

describe('statistics collection', function ()  {
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

    before('collect stats before each of 2 separate leaks', async function() {
      this.heap = Heapstats({ test: this })

      this.statsA = await this.heap.stats()

      for (let i = 0; i < 5; i++)
        await this.leakyFunction({ leak: this.leak, mb: 5 })

      this.statsB = await this.heap.stats()

      for (let i = 0; i < 5; i++)
        await this.leakyFunction({ leak: this.leak, mb: 5 })

      this.statsC = await this.heap.stats()
    })

    it ('records the same small initial in all checkpoints', function() {
      this.statsA.initial.should.be.within(5, 15)
      this.statsB.initial.should.be.within(5, 15)
      this.statsC.initial.should.be.within(5, 15)
    })

    it ('records an increase in current between checkpoints', function() {
      this.statsA.current.should.be.within(5, 15)
      this.statsB.current.should.be.within(20, 40)
      this.statsC.current.should.be.within(40, 80)
    })

    it ('records an increase in max between checkpoints', function() {
      this.statsA.current.should.be.within(5, 15)
      this.statsB.current.should.be.within(20, 40)
      this.statsC.current.should.be.within(40, 80)
    })
  })

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
