import chai from 'chai'

import Memstat from '../index.js'

chai.should()

describe('#memstat', function ()  {
  beforeEach('setup memstat', function() {
    this.memstat = Memstat()
    this.nonLeakyFunction = function(a, b) {
      return a ** b
    }
  })

  describe ('#memstat.end()', function() {
    describe('Statistics collection', function() {
      it ('returns a statistics object', async function() {
        await this.memstat.sample(() => this.nonLeakyFunction(2, 3))

        const usage = await this.memstat.end(this)
        usage.should.include.keys([
          'plot',
          'initial',
          'current',
          'stats',
          'increasePercentage',
          'max'
        ])
        usage.plot.should.be.a('String').with.length
        usage.initial.should.be.a('Number').above(0)
        usage.current.should.be.a('Number').above(0)
        usage.max.should.be.a('Number').above(0)
        usage.increasePercentage.should.be.a('Number')
        usage.stats.should.be.an('Array').with.length.above(0)
      })
    })

    describe('ASCII Plot', function() {
      before(async function() {
        await this.memstat.sample(() => this.nonLeakyFunction(2, 3))
        this.usage = await this.memstat.end(this)
      })

      it ('returns an ASCII plot', function() {
        this.usage.plot.should.have.length.above(100)
        this.usage.plot.should.include('heap')
      })

      it ('has a default title', function() {
        this.usage.plot.should.include('Heap Allocation Timeline')
      })

      it ('shows initial usage', function() {
        this.usage.plot.should.include('Initial:')
      })

      it ('shows current usage', function() {
        this.usage.plot.should.include('Cur:')
      })

      it ('shows max usage', function() {
        this.usage.plot.should.include('Max:')
      })

      it ('shows number of GC cycles', function() {
        this.usage.plot.should.include('GC Cycles:')
      })
    })
  })
})
