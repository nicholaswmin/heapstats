import util from 'node:util'
import { exec as _exec } from 'node:child_process'
import chai from 'chai'

chai.should()
const exec = util.promisify(_exec)

describe('test sync/async/done', function() {
  this.timeout(20 * 10000).slow(15 * 1000)

  describe ('test is completely synchronous', function() {
    beforeEach(async function() {
      // plot is padded by these to aid selecting it:
      this.plotIds = { start: '⬝⬝', end: '⬞⬞' }

      try {
        await exec(`npx mocha test/mocha/it/sync.js --no-package`)
        throw new Error('All tests have passed, expected a failure.')
      } catch (err) {
        if (!err.code)
          throw err

        if (err.stderr)
          throw new Error(err.stderr)

        this.stdout = err.stdout
      }
    })

    describe('and the test fails because of an assertion issue', function() {
      it ('correctly fails one tests', function() {
        this.stdout.should.include('2 passing')
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

      it ('draws the plot between after the 3rd test', function() {
        const third = this.stdout.indexOf('3 - fails')
        const plotStart = this.stdout.indexOf(this.plotIds.start)
        const plotEnd = this.stdout.indexOf(this.plotIds.end)

        plotStart.should.be.greaterThan(third)
      })
    })
  })


  describe ('test is asynchronous and uses done()', function() {
    beforeEach(async function() {
      // plot is padded by these to aid selecting it:
      this.plotIds = { start: '⬝⬝', end: '⬞⬞' }

      try {
        await exec(`npx mocha test/mocha/it/done.js --no-package`)
        throw new Error('All tests have passed, expected a failure.')
      } catch (err) {
        if (!err.code)
          throw err

        if (err.stderr)
          throw new Error(err.stderr)

        this.stdout = err.stdout
      }
    })

    describe('and the test fails because of an assertion issue', function() {
      it ('correctly fails one tests', function() {
        this.stdout.should.include('2 passing')
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

      it ('draws the plot between after the 3rd test', function() {
        const third = this.stdout.indexOf('3 - fails')
        const plotStart = this.stdout.indexOf(this.plotIds.start)
        const plotEnd = this.stdout.indexOf(this.plotIds.end)

        plotStart.should.be.greaterThan(third)
      })
    })
  })

  describe ('test is asynchronous and uses async/await', function() {
    beforeEach(async function() {
      // plot is padded by these to aid selecting it:
      this.plotIds = { start: '⬝⬝', end: '⬞⬞' }

      try {
        await exec(`npx mocha test/mocha/it/async.js --no-package`)
        throw new Error('All tests have passed, expected a failure.')
      } catch (err) {
        if (!err.code)
          throw err

        if (err.stderr)
          throw new Error(err.stderr)

        this.stdout = err.stdout
      }
    })

    describe('and the test fails because of an assertion issue', function() {
      it ('correctly fails one tests', function() {
        this.stdout.should.include('2 passing')
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

      it ('draws the plot between after the 3rd test', function() {
        const third = this.stdout.indexOf('3 - fails')
        const plotStart = this.stdout.indexOf(this.plotIds.start)
        const plotEnd = this.stdout.indexOf(this.plotIds.end)

        plotStart.should.be.greaterThan(third)
      })
    })
  })
})
