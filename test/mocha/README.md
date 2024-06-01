# Mocha integration tests

These tests, primarily test whether this module integrates well with Mocha.

A good implementation will:

- Automatically draw a plot but only if the test fails.
- Plot the plot next to it's corresponding failing test.
- Plot a reasonably sized plot

## How we unit-test mocha with mocha

To test this, we write some usual mocha test files and run them with
`ChildProcess.exec` instead of using mocha directly.

This creates some output which we collect and run a bit of string matching
against them, trying to infer if it plotted the plot at the right time
and at the right place and size, more or less.

tests that don't include `.spec.js` in their filename are Mocha files that
are only meant to be run by their accompanying runner - so don't run tests
that dont have `.spec.js` in their filename; they are only meant to be run
by their runner when we do `npm test`.

Example:

This `test/one-level-test.spec.js` is a runner which runs this
`one-level.spec.js` and runs some tests against the output.

## Authors

[@nicholaswmin][github.com/nicholaswmin]
