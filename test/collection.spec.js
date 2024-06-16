import chai from 'chai'

import Heapstats from '../index.js'

chai.should()

const addTwoNumbers = (a, b) => {
  Array.isArray(global.leak) ?
    global.leak.push(JSON.stringify([Math.random().toString().repeat(15000)])) :
    global.leak = []

  return new Promise(resolve => setTimeout(() => resolve(a + b), 1))
}

const addTwoNumbersNonLeaky = (a, b) =>
  new Promise(resolve => setTimeout(() => resolve(a + b), 1))

describe('#sample', function ()  {
  describe('function under test is asynchronous', function() {
    describe ('stats collection', function() {
      describe('against a leaky function', function() {
        after(function() {
          global.leak = []
          global.gc()
        })

        before('collect stats before each of 2 leaks', async function() {
          this.heap = Heapstats({ test: this })

          this.statsA = await this.heap.stats()

          for (let i = 0; i < 100; i++)
            await addTwoNumbers(3, 5)

          this.statsB = await this.heap.stats()

          for (let i = 0; i < 100; i++)
            await addTwoNumbers(3, 5)

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
    })

    describe ('against a non-leaky function', function() {
      before('collect stats before each of 2 separate leaks', async function() {
        this.heap = Heapstats({ test: this })

        this.statsA = await this.heap.stats()

        for (let i = 0; i < 100; i++)
          await addTwoNumbersNonLeaky(3, 5)

        this.statsB = await this.heap.stats()

        for (let i = 0; i < 100; i++)
          await addTwoNumbersNonLeaky(3, 5)

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
})
