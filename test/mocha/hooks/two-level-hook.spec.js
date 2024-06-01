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
      await exec(`npx mocha test/mocha/hooks/two-level-hook.js --no-package`)
    } catch (err) {
      if (!err.isKilled) {
        return (this.stdout = err.stdout)
      }

      throw err
    }
  })

  describe('and 3rd of 5 tests fails with an assertion error', function() {
    it ('correctly fails two tests', function() {
      this.stdout.should.include('7 passing')
      this.stdout.should.include('2 failing')
      this.stdout.should.include("'Jane' to have a length of 3 but got 4")
    })

    it ('draws a plot', function() {
      this.stdout.should.include(this.plotIds.start)
    })

    it ('draws only two plots', function() {
      const count = this.stdout.trim().split(this.plotIds.start).length - 1
      count.should.equal(2)
    })

    describe('1st plot', function() {
      it ('draws the plot title matching the 1st failed test', function() {
        this.stdout.should.include('Test: "3 - fails" has failed')
      })

      it ('draws the plot with height between 15 - 30 rows', function() {
        const plotStart = this.stdout.indexOf(this.plotIds.start)
        const plotEnd = this.stdout.indexOf(this.plotIds.end)
        const plot = this.stdout.substring(plotStart, plotEnd)
        const height = plot.split('\n').length
        height.should.be.within(10, 30)
      })

      it ('draws the plot between 3rd test and 4th test', function() {
        const third = this.stdout.indexOf('3 - fails')
        const plotStart = this.stdout.indexOf(this.plotIds.start)
        const plotEnd = this.stdout.indexOf(this.plotIds.end)
        const fourth = this.stdout.indexOf('4 - passes')

        plotStart.should.be.within(third, plotEnd)
        plotEnd.should.be.within(plotStart, fourth)
      })
    })

    describe('2nd plot', function() {
      it ('draws a plot title matching the 2nd failed test', function() {
        this.stdout.should.include('Test: "2.4 - passes" has failed')
      })

      it ('draws the plot with height between 15 - 30 rows', function() {
        const firstPlotEnd = this.stdout.indexOf(this.plotIds.end)
        const stdout1 = this.stdout.substring(0, firstPlotEnd - 1)
        const stdout2 = this.stdout.substring(firstPlotEnd + 1, this.stdout.length - 1)

        const plotStart = stdout2.indexOf(this.plotIds.start)
        const plotEnd = stdout2.indexOf(this.plotIds.end)
        const plot = stdout2.substring(plotStart, plotEnd)
        const height = plot.split('\n').length

        height.should.be.within(10, 30)
      })

      it ('draws the plot between 2.3 test and 2.4 test', function() {
        const firstPlotEnd = this.stdout.indexOf(this.plotIds.end)
        const stdout1 = this.stdout.substring(0, firstPlotEnd - 1)
        const stdout2 = this.stdout.substring(firstPlotEnd + 1, this.stdout.length - 1)

        const twoThree = stdout2.indexOf('2.3')
        const plotStart = stdout2.indexOf(this.plotIds.start)
        const plotEnd = stdout2.indexOf(this.plotIds.end)
        const twoFour = stdout2.indexOf('2.4')

        plotStart.should.be.within(twoThree, plotEnd)
      })
    })
  })
})
