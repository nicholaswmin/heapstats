import chai from 'chai'

import Heapstats from '../index.js'

chai.should()

describe ('#stats()', function() {
  before('setup heapstats', function() {
    this.heap = Heapstats({ test: this })
    this.nonLeakyFunction = function(a, b) {
      return a ** b
    }
  })

  describe('collects heap statistics, and returns a:', function() {
    before(async function() {
      await this.heap.sample(() => this.nonLeakyFunction(2, 3))

      this.stats = await this.heap.stats()
    })

    it ('statistics object', async function() {
      this.stats.should.be.ok
      this.stats.should.be.an('Object').and.include.keys([
        'plot', 'initial', 'current', 'snapshots', 'increasePercentage', 'max'
      ])

      this.stats.plot.should.be.a('String').with.length

      this.stats.initial.should.be.a('Number').within(1, 25)

      this.stats.current.should.be.a('Number').within(1, 150)

      this.stats.max.should.be.a('Number').within(1, 25000)

      this.stats.increasePercentage.should.be.a('Number').within(-999, 99999)

      this.stats.snapshots.should.be.an('Array').with.length.above(0)
    })

    it ('current and previous heap size values', async function() {
      this.stats.snapshots.should.have.length.above(0)
      this.stats.snapshots[0].should.be.an('Object').and.include.keys([
        'used_heap_size_mb'
      ])

      this.stats.snapshots[0].used_heap_size_mb.should.be.a('Number').above(10)
    })
  })

  describe('returns an ASCII plot, with:', function() {
    before(async function() {
      if (process.env.ENV_CI)
        this.skip()

      await this.heap.sample(() => this.nonLeakyFunction(2, 3))
      this.stats = await this.heap.stats()
    })

    it ('the ASCII plot text', function() {
      this.stats.plot.should.have.length.above(100)
    })

    it ('a default title', function() {
      this.stats.plot.should.include('Heap Allocation')
    })

    it ('initial usage', function() {
      this.stats.plot.should.include('Initial:')
    })

    it ('current usage', function() {
      this.stats.plot.should.include('Cur:')
    })

    it ('max usage', function() {
      this.stats.plot.should.include('Max:')
    })

    it ('number of GC cycles', function() {
      this.stats.plot.should.include('GC Cycles:')
    })
  })

  describe('passing a ctx parameter', function() {
    beforeEach(async function() {
      await this.heap.sample(() => this.nonLeakyFunction(2, 3))

      this.stats = await this.heap.stats
    })

    describe('passing a mocha ctx', function() {
      it ('uses the parent title as the plot title', async function() {
        this.stats = await this.heap.stats()

        this.stats.plot.should.include('Heap Allocation Timeline')
      })
    })

    describe.skip('passing a custom ctx', function() {
      // @FIXME not sure why its not working
      beforeEach(async function() {
        this.stats = await this.heap.stats
      })

      it ('uses the passed test title as the plot title', function() {
        this.stats.plot.should.include('Foo Title')
      })
    })
  })
})
