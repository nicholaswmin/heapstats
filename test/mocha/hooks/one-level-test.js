// @IMPORTANT: This file is **only** meant to be run by it's equivalent
// <same-name>.spec.js runner file.
//
// Do not run as part of tests. It intentionally has a dash in the filename
// to indicate it's machine runnable by our custom runners, not mocha directly.

import chai from 'chai'
import Heapstats from '../../../index.js'

chai.should()

describe ('Describe block 1', function() {
  beforeEach(function() {
    this.heap = Heapstats({ test: this })
  })

  it ('1 - passes', function() {
    'Joe'.should.have.length(3)
  })

  it ('2 - passes', function() {
    this.heap = Heapstats({ test: this })
    'Jane'.should.have.length(4)
  })

  it ('3 - fails', function() {
    'Jane'.should.have.length(3)
  })
})
