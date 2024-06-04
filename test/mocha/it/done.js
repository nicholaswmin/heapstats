// @IMPORTANT: This file is **only** meant to be run by it's
// `runner.spec.js` runner file.

import chai from 'chai'
import Heapstats from '../../../index.js'

chai.should()

function addTwoNumbers(a, b) {
  return a + b
}

function addTwoNumbersAsync(numbers, cb) {
  setTimeout(() => {
    cb(numbers[0] + numbers[1])
  })
}

describe ('Describe block level 1', function() {
  it ('1 - passes', function() {
    this.heap = Heapstats({ test: this })

    const result = addTwoNumbers(5, 3)

    result.should.equal(8)
  })

  it ('2 - passes', function() {
    this.heap = Heapstats({ test: this })

    const result = addTwoNumbers(5, 3)

    result.should.equal(8)
  })

  it ('3 - fails', function(done) {
    this.heap = Heapstats({ test: this })

    addTwoNumbersAsync([5, 3], function(result) {
      result.should.equal(10)
      done()
    })
  })
})
