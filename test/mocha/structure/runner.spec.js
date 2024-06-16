import util from 'node:util'
import { exec as _exec } from 'node:child_process'
import chai from 'chai'

chai.should()
const exec = util.promisify(_exec)

describe('test structure', function() {
  this.timeout(20 * 1000).slow(15 * 1000)

  describe ('setup takes place in a beforeEach hook', function() {
    beforeEach(async function() {
      // plot is padded by these to aid selecting it:
      this.plotIds = { start: '⬝⬝', end: '⬞⬞' }

      try {
        await exec(`npx mocha test/mocha/structure/flat.js --no-package`)
        throw new Error('All tests have passed, expected a failure.')
      } catch (err) {
        if (!err.code)
          throw err

        this.stdout = err.stdout
      }
    })

    describe('and 3rd of 5 tests fails with an assertion error', function() {
      it ('correctly fails that one test only', function() {
        this.stdout.should.include('4 passing')
        this.stdout.should.include('1 failing')
        this.stdout.should.include("expected 8 to equal 10")
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

  describe ('setup takes place in nested beforeEach hooks', function() {
    this.timeout(20 * 10000).slow(15 * 1000)

    beforeEach(async function() {
      // plot is padded by these to aid selecting it:
      this.plotIds = { start: '⬝⬝', end: '⬞⬞' }

      try {
        await exec(`npx mocha test/mocha/structure/nested.js --no-package`)
        throw new Error('All tests have passed, expected a failure.')
      } catch (err) {
        if (!err.code)
          throw err

        this.stdout = err.stdout
      }
    })

    describe('and 3rd of 5 tests fails with an assertion error', function() {
      it ('correctly fails two tests', function() {
        this.stdout.should.include('7 passing')
        this.stdout.should.include('2 failing')
        this.stdout.should.include("expected 8 to equal 10")
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
          this.stdout.should.include('Test: "3 - fails" has failed')
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

})
