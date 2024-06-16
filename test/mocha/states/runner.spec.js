import util from 'node:util'
import { exec as _exec } from 'node:child_process'
import chai from 'chai'

chai.should()
const exec = util.promisify(_exec)

describe('draw plot only if test result ends in:', function() {
  this.timeout(20 * 10000).slow(15 * 1000)

  describe ('default - only on "failed"', function() {
    beforeEach(async function() {
      // plot is padded by these to aid selecting it:
      this.plotIds = { start: '⬝⬝', end: '⬞⬞' }

      try {
        await exec(`npx mocha test/mocha/states/default.js --no-package`)
        throw new Error('All tests have passed, expected a failure.')
      } catch (err) {
        if (!err.code)
          throw err

        if (err.stderr)
          throw new Error(err.stderr)

        this.stdout = err.stdout
      }
    })

    it ('draws one plot for the only failed test', function() {
      const count = this.stdout.trim().split(this.plotIds.start).length - 1
      count.should.equal(1)
    })
  })

  describe ('dont draw for any state', function() {
    beforeEach(async function() {
      // plot is padded by these to aid selecting it:
      this.plotIds = { start: '⬝⬝', end: '⬞⬞' }

      try {
        await exec(`npx mocha test/mocha/states/none.js --no-package`)
        throw new Error('All tests have passed, expected a failure.')
      } catch (err) {
        if (!err.code)
          throw err

        if (err.stderr)
          throw new Error(err.stderr)

        this.stdout = err.stdout
      }
    })

    it ('does not draw any plots', function() {
      const count = this.stdout.trim().split(this.plotIds.start).length - 1
      count.should.equal(0)
    })
  })

  describe ('draw for any state (both "passed" and "failed")', function() {
    beforeEach(async function() {
      // plot is padded by these to aid selecting it:
      this.plotIds = { start: '⬝⬝', end: '⬞⬞' }

      try {
        await exec(`npx mocha test/mocha/states/all.js --no-package`)
        throw new Error('All tests have passed, expected a failure.')
      } catch (err) {
        if (!err.code)
          throw err

        if (err.stderr)
          throw new Error(err.stderr)

        this.stdout = err.stdout
      }
    })

    it ('draws a plot for each test', function() {
      const count = this.stdout.trim().split(this.plotIds.start).length - 1
      count.should.equal(3)
    })
  })
})
