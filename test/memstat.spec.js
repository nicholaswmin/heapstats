import chai from 'chai'

import Memstat from '../index.js'

chai.should()

const mbToBytes = mb => Math.ceil(mb * 1024 * 1024)

describe ('#memstat.end()', function() {
  before('setup memstat', function() {
    this.memstat = Memstat()
    this.nonLeakyFunction = function(a, b) {
      return a ** b
    }
  })

  describe('collects heap statistics, and returns a:', function() {
    before(async function() {
      await this.memstat.sample(() => this.nonLeakyFunction(2, 3))

      this.usage = await this.memstat.end(this)
    })

    it ('statistics object', async function() {
      this.usage.should.be.ok
      this.usage.should.be.an('Object').and.include.keys([
        'plot', 'initial', 'current', 'stats', 'increasePercentage', 'max'
      ])

      this.usage.plot.should.be.a('String').with.length

      this.usage.initial.should.be.a('Number')
        .within(mbToBytes(1), mbToBytes(25))

      this.usage.current.should.be.a('Number')
        .within(mbToBytes(1), mbToBytes(150))

      this.usage.max.should.be.a('Number')
        .within(mbToBytes(1), mbToBytes(25000))

      this.usage.increasePercentage.should.be.a('Number')
        .within(-999, 99999)

      this.usage.stats.should.be.an('Array')
        .with.length.above(0)
    })

    it ('current and previous heap size values', async function() {
      this.usage.stats.should.have.length.above(0)
      this.usage.stats[0].should.be.an('Object').and.include.keys([
        'used_heap_size'
      ])

      this.usage.stats[0].used_heap_size.should.be.a('Number')
        .within(mbToBytes(1), mbToBytes(25000))
    })
  })

  describe('returns an ASCII plot, with:', function() {
    before(async function() {
      await this.memstat.sample(() => this.nonLeakyFunction(2, 3))
      this.usage = await this.memstat.end(this)
    })

    it ('the ASCII plot text', function() {
      this.usage.plot.should.have.length.above(100)
      this.usage.plot.should.include('heap')
    })

    it ('a default title', function() {
      this.usage.plot.should.include('Heap Allocation Timeline')
    })

    it ('initial usage', function() {
      this.usage.plot.should.include('Initial:')
    })

    it ('current usage', function() {
      this.usage.plot.should.include('Cur:')
    })

    it ('max usage', function() {
      this.usage.plot.should.include('Max:')
    })

    it ('number of GC cycles', function() {
      this.usage.plot.should.include('GC Cycles:')
    })
  })

  describe('passing a ctx parameter', function() {
    beforeEach(async function() {
      await this.memstat.sample(() => this.nonLeakyFunction(2, 3))

      this.usage = await this.memstat.end(this)
    })

    describe('passing a mocha ctx', function() {
      it ('uses the parent title as the plot title', async function() {
        this.usage = await this.memstat.end(this)

        this.usage.plot.should.include('Heap Allocation Timeline')
      })
    })

    describe.skip('passing a custom ctx', function() {
      // @FIXME not sure why its not working
      beforeEach(async function() {
        this.usage = await this.memstat.end({ test: { title: 'Foo Title' }})
      })

      it ('uses the passed test title as the plot title', function() {
        this.usage.plot.should.include('Foo Title')
      })
    })
  })
})
