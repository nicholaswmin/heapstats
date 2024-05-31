[![test-workflow][test-workflow-badge]][ci-test]

# memstat

terminal-based [V8 heap allocation][oilpan] plotter for unit-tests

![Mocha test results showing an ASCII timeline plot of the memory usage][demo]

## Install

```bash
npm i git+ssh://git@github.com:nicholaswmin/memstat.git
```

## Usage

`memstat.sample(() => fn())`

Run a potentially leaky function 100 times,
then plot the allocation timeline:

```js
import Memstat from 'memstat'

const memstat = Memstat()

for (let i = 0; i < 100; i++)
  await memstat.sample(() => leakyFunction())

const usage = await memstat.end()

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

`memstat.record()`

```js
app.get('/users', (req, res) => {
  const memstat = Memstat()
  await  memstat.record()

  for (let i = 0; i < 200; i++)
    await leakyFunction('leak')

  // or anything sync or async.. .

  res.json({ foo: 'bar' })

  console.log(await memstat.getStats())
})
```

> Not really "time-based", strictly speaking; it's collected immediately
> following a garbage collection cycle.

### Additional stats

Apart from the ASCII plot, `memstat.end()` returns:

```js
console.log(usage)
/*
  initial: 9920688, // heap size bytes on instantiation
  current: 9936184, // current heap size bytes
  max: 9936184, // maximum size of allocated heap,
  increasePercentage: 2.4, // difference of current and initial, expressed in %
  stats: [V8HeapStats, V8HeapStats, V8HeapStats...] // collected stats
*/
```

`V8HeapStats` is an object containing heap allocation details and statistics   
returned by [v8.getHeapStatistics()][v8-heap-doc]

### As a unit-testing utility

This tool was made for integration into a testing suite.

In [Mocha][mocha], you can pass the test context to `memstat.end(this)` and
the plot will draw on failed tests on it's own.

```js
describe ('when the function is run 100 times', function() {
  before('setup test', function() {
    this.memstat = Memstat()
  })

  it ('does not leak memory', async function() {
    for (let i = 0; i < 200; i++)
      await this.memstat.sample(() => leakyFunction(2, 3))

    const usage = this.memstat.end(this) // pass this

    expect(usage.percentageIncrease).to.be.below(10)
    expect(usage.current).to.be.below(1024 * 1024 * 100)
  })

  // ... rest of tests
})
```

Non-mocha test frameworks can pass a test context like so:

`this.memstat.end({ test: { title: 'A whatever test', state: 'failed' }})`


### Tail mode

To observe realtime heap statistics:

```js
import Memstat from 'memstat'
```

and start with flag `--memstat`, i.e:

```bash
node app.js --memstat
```

which does this:

![GIF showing realtime memory usage as a line plot, in terminal][tail-demo]

Note that while live mode is pinned, any output to `stdout`/`stderr`
is suppressed to avoid interfering with the redraw of the plot.

In other words logging won't work while the plot is tailing.

## Test

```bash
npm test
```

### Notes

- [Avoid arrow functions][no-mocha-arrow] in Mochas `describe`/`it`,
  otherwise `this` will refer to the wrong scope.
- Make sure you `await memstat.sample(() => functionUnderTest())`

[More examples here][examples].

### License

> 2024 Nik Kyriakides, [@nicholaswmin][nicholaswmin]

> The MIT License

> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:

[nicholaswmin ]: https://github.com/nicholaswmin
[test-workflow-badge]: https://github.com/nicholaswmin/memstat/actions/workflows/tests.yml/badge.svg
[ci-test]: https://github.com/nicholaswmin/memstat/actions/workflows/tests.yml
[v8-heap-doc]: https://nodejs.org/api/v8.html#v8getheapstatistics
[oilpan]: https://v8.dev/blog/oilpan-library
[demo]: .github/docs/demo.png
[tail-demo]: .github/docs/tail-demo.gif
[mocha]: https://mochajs.org/
[no-mocha-arrow]: https://github.com/meteor/guide/issues/318
[examples]: .github/examples
