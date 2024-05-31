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
    it ('returns a statistics object', async function() {
      await this.memstat.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.memstat.end(this)

      usage.should.include.keys(['plot', 'initial', 'current', 'snapshots'])
      usage.plot.should.be.a('String')
      usage.initial.should.be.a('Number')
      usage.current.should.be.a('Number')
      usage.snapshots.should.be.an('Array')
    })

    it ('returns an ASCII plot', async function() {
      await this.memstat.sample(() => this.nonLeakyFunction(2, 3))

      const usage = await this.memstat.end(this)

      usage.plot.should.have.length.above(100)
    })
  })
})
