[![test-workflow][test-workflow-badge]][ci-test]

# memplot

terminal-based [V8 heap allocation statistics][oilpan] plotter for unit-tests

![Mocha test results showing an ASCII timeline plot of the memory usage][demo]

## Install

```bash
npm i git+ssh://git@github.com:nicholaswmin/memplot.git
```

## Usage

`memplot.sample(() => fn())`

Runs a potentially leaky function 100 times,
then plots the allocation timeline:

```js
import Memplot from 'memplot'

const memplot = Memplot()

for (let i = 0; i < 100; i++)
  await memplot.sample(() => leakyFunction())

const usage = await memplot.end()

console.log(usage.plot)
```

where a leaky function could look like this:

```js
let leak = '' // oops

function aLeakyFunction(a, b) {
  leak += JSON.stringify([`${Math.random()}`.repeat(500000)])

  return a + b
}
```

### Time based collection

`memplot.record()`

```js
app.get('/users', (req, res) => {
  const memplot = Memplot()
  await memplot.record()

  for (let i = 0; i < 200; i++)
    await leakyFunction('leak')

  // or anything sync or async.. .

  res.json({ foo: 'bar' })

  console.log(await memplot.getStats())
})
```

> NOTE: Not really "time-based", strictly speaking it's collected
> immediately following a garbage collection/compaction cycle.

Read: [MDN: PerformanceObserver][mdn-perf-observer]

### Additional stats

Apart from the ASCII plot, `memplot.end()` returns:

```js
console.log(usage)
/*
  initial: 16863610, // heap size bytes on instantiation
  current: 86857600, // current heap size bytes
  max: 104857600, // maximum size of allocated heap at any point,
  increasePercentage: 2.4, // difference of current and initial, expressed in %
  stats: [V8HeapStats, V8HeapStats, V8HeapStats...] // collected stats
*/
```

Where `V8HeapStats` is an object containing heap allocation statistics, as
return by [v8.getHeapStatistics()][v8-heap-doc]

### As a unit-testing utility

This tool was made for integration into a testing suite.

In [Mocha][mocha], you can pass the test context to `memplot.end(this)` and
the plot will draw on failed tests on it's own.

```js
describe ('when the function is run 100 times', function() {
  before('setup test', function() {
    this.memplot = Memplot()
  })

  it ('does not leak memory', async function() {
    for (let i = 0; i < 200; i++)
      await this.memplot.sample(() => leakyFunction(2, 3))

    const usage = this.memplot.end(this) // pass this

    expect(usage.percentageIncrease).to.be.below(10)
    expect(usage.current).to.be.below(1024 * 1024 * 100)
  })

  // ... rest of tests
})
```

Non-mocha test frameworks can pass a test context like so:

`this.memplot.end({ test: { title: 'A whatever test', state: 'failed' }})`


### Tail mode

To observe realtime heap statistics:

```js
import Memplot from 'memplot'
```

and start with flag `--memplot`, i.e:

```bash
node app.js --memplot
```

which does this:

![GIF showing realtime memory usage as a line plot, in terminal][tail-demo]

Note that while the tail mode is pinned, any output to `stdout`/`stderr`
is suppressed to avoid interference with the plot redraw cycle.

In other words `console.log`/`err` etc won't work while the plot is tailing.

## Test

```bash
npm test
```

### Notes

Only useful when you have (founded) concerns about the memory safety of
somewhat critical code you're prototyping,
otherwise it can make your unit tests [brittle][brittle-tests] and annoying. 

Memory leak testing is implicitly and probably more appropriately
tested during full-scale load tests - not while unit testing.

It's almost impossible to discern a false positive from a false-negative
when unit-testing for memory leaks, unless visually inspected, the plotter
makes it somewhat tolerable in figuring out if a test failure is
a false positive.

Real memory leaks will usually demonstrate as a characteristic linearly
increasing sawtooth pattern that outlive the invocation of the component.

This module does nothing in helping figuring out where a memory leak is
coming from, it's only purpose is to plot an allocation timeline.

[More examples here][examples].

### License

> 2024 Nik Kyriakides, [@nicholaswmin][nicholaswmin]

> The MIT License
> SPDIX: MIT

> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so.

[nicholaswmin ]: https://github.com/nicholaswmin
[test-workflow-badge]: https://github.com/nicholaswmin/memplot/actions/workflows/tests.yml/badge.svg
[ci-test]: https://github.com/nicholaswmin/memplot/actions/workflows/tests.yml
[v8-heap-doc]: https://nodejs.org/api/v8.html#v8getheapstatistics
[mdn-perf-observe]: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver
[oilpan]: https://v8.dev/blog/oilpan-library
[demo]: .github/docs/demo.png
[tail-demo]: .github/docs/tail-demo.gif
[mocha]: https://mochajs.org/
[no-mocha-arrow]: https://github.com/meteor/guide/issues/318
[examples]: .github/examples
[brittle-tests]: https://abseil.io/resources/swe-book/html/ch12.html
