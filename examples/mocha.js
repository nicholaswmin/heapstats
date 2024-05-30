import { expect } from 'chai'

import Memstat from '../index.js'
import leakyFunction from '../test/leaky-function.js'

describe('#leakyFunction', function ()  {
  beforeEach(function() {
    this.memstat = new Memstat({
      drawPlot: true,
      window: {
        width: process.stdout.columns - 50,
        height: process.stdout.rows - 10
      }
    })
    this.memstat.start()
  })

  it ('adds 2 numbers', async function() {
    const result = await leakyFunction(2, 3)

    expect(result).to.be.a('Number')
    expect(result).to.equal(5)
  })

  describe('when run 100 times', function() {
    this.timeout(5000)

    it ('does not leak memory', async function() {
      for (let i = 0; i < 200; i++)
        await leakyFunction(2, 3)

      const memory = this.memstat.stop()

      expect(memory.leaks).to.equal(false)
    })
  })
})
