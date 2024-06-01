// @IMPORTANT: This file is **only** meant to be run by it's equivalent
// <same-name>.spec.js runner file.

import util from 'node:util'
import { exec as _exec } from 'node:child_process'
import chai from 'chai'

import Heapstats from '../../../index.js'

chai.should()
const exec = util.promisify(_exec)

describe ('when its instantiated in a beforeEach hook', function() {
  this.timeout(20 * 10000).slow(15 * 1000)

  beforeEach(async function() {
    // plot is padded by these to aid selecting it:
    this.plotIds = { start: '⬝⬝', end: '⬞⬞' }

    try {
      await exec(`npx mocha test/mocha/hooks/one-level-hook.js --no-package`)
    } catch (err) {
      if (!err.isKilled) {
        return (this.stdout = err.stdout)
      }

      throw err
    }
  })

  describe('and 3rd of 5 tests fails with an assertion error', function() {
    it ('correctly fails that one test only', function() {
      this.stdout.should.include('4 passing')
      this.stdout.should.include('1 failing')
      this.stdout.should.include("'Jane' to have a length of 3 but got 4")
    })

    it ('draws a plot', function() {
      this.stdout.should.include(this.plotIds.start)
    })

    it ('draws only one plot', function() {
      const count = this.stdout.trim().split(this.plotIds.start).length - 1
      count.should.equal(1)
    })

    it ('draws a plot title matching the failed test', function() {
      this.stdout.should.include('Test: "3 - fails" has failed')
    })

    it ('draws a plot with height between 15 - 30 rows', function() {
      const plotStart = this.stdout.indexOf(this.plotIds.start)
      const plotEnd = this.stdout.indexOf(this.plotIds.end)
      const plot = this.stdout.substring(plotStart, plotEnd)
      const height = plot.split('\n').length
      height.should.be.within(10, 30)
    })

    it ('draws a plot between 3rd test and 4th test', function() {
      const third = this.stdout.indexOf('3 - fails')
      const plotStart = this.stdout.indexOf(this.plotIds.start)
      const plotEnd = this.stdout.indexOf(this.plotIds.end)

      plotStart.should.be.within(third, plotEnd)
    })
  })
})
