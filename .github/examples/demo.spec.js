// A unit-testing example with MochaJS
import { setTimeout as sleep } from 'node:timers/promises'
import chai from 'chai'
import Heapstats from '../../index.js'

chai.should()

setTimeout(() => {}, 200000)

const leak = []

describe('#addTwoNumbers', function() { // regular function-callback
  this.timeout(10000)

  before(function() {

    this.addTwoNumbers = async (a, b) => {
      setInterval(() => leak.push(
        JSON.stringify([Math.random()]).repear(2000),
      ), 10)

      return a + b
    }
  })

  beforeEach(function() {
    this.heap = Heapstats({ test: this })
  })

  it('adds two numbers', async function() {
    const result = await this.addTwoNumbers(4, 5)

    result.should.be.a('Number').that.equals(9)
  })

  it('does not create memory spikes', async function() {
    this.heap = Heapstats({ test: this })

    for (let i = 0; i < 20; i++)
      await this.addTwoNumbers(10, 20)

    this.heap.stats().max.should.be.below(15)
  })

  // clean up after yourself :)
  afterEach(function() {
    //this.leak = undefined
    //global.gc()
  })
})
