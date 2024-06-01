// Verify that plot is drawn correctly on a failing test
// where only the last of many assertions is failing
// Run with `mocha mocha-leaky.js --no-package --exit`

import { setTimeout as sleep } from 'node:timers/promises'
import chai from 'chai'
import Heapstats from '../../index.js'

chai.should()
describe('Synchronous', function() {
  beforeEach('setup', function() {
    this.heap = Heapstats({ test: this })
  })

  it ('fails at the last assertion of many ', async function() {
    (true).should.equal(true);
    (true).should.equal(true);
    (true).should.equal(true);
    (true).should.equal(true);
    ('John Doe').should.have.length(8);
    (3).should.equal(2);
  })
})

describe('Asynchronous', function() {
  beforeEach('setup', function() {
    this.heap = Heapstats({ test: this })
  })

  // @FIXME shows as working when it doesnt
  it ('fails at the last assertion of many ', async function() {
    (true).should.equal(true);
    (true).should.equal(true);
    (true).should.equal(true);
    (true).should.equal(true);
    ('John Doe').should.have.length(8);
    await sleep(200);
    (3).should.equal(2);
  })
})
