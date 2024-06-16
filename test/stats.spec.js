import chai from 'chai'

import Heapstats from '../index.js'

chai.should()

const addTwoNumbersNonLeaky = (a, b) => {
  return new Promise(resolve => setTimeout(() => resolve(a + b), 1))
}

describe ('#stats()', function() {
  before('setup heapstats', function() {
    this.heap = Heapstats({ test: this })
  })

  describe('collects heap statistics, and returns a:', function() {
    before(async function() {
      await this.heap.sample(() => addTwoNumbersNonLeaky(2, 3))

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

      this.stats.snapshots[0].used_heap_size_mb.should.be.a('Number').above(5)
    })
  })

  describe('returns an ASCII plot, with:', function() {
    before(async function() {
      await this.heap.sample(() => addTwoNumbersNonLeaky(2, 3))
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
})
