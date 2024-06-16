# Mocha integration tests

These tests, primarily test whether this module integrates well with Mocha.

A good implementation will draw a plot:

- Only if the test fails
- In every test mode (sync, async via `done` and async via `async function`),   
  - i.e:
    - `it('foo', function (){  })`
    - `it('foo', function (done) { done() })`
    - `it('foo', async function () {  })`
- Next to it's corresponding failing test
- In reasonable dimensions

## How to run

Never run: `mocha async.js`.

Instead run: `mocha runner.js` which will autorun `async.js`.

The test suite (or you) should only run the `runner.spec.js` files.
The rest of the files are meant to be run by the `runner.spec.js` itself,
using `childProcess.exec`

This creates some output which is collected in the runner which run a bit of
string matching against them, trying to infer if it plotted the plot at
the right time and at the right place and size, more or less.

tests that don't include `.spec.js` in their filename are Mocha files that
are only meant to be run by their accompanying runner - so don't run tests
that dont have `.spec.js` in their filename; they are only meant to be run
by their runner when we do `npm test`.

## Authors

[@nicholaswmin][github.com/nicholaswmin]
