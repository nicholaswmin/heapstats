[![test-workflow][test-workflow-badge]][ci-test]

# memstat

terminal-based heap allocation plotter for Node

![Mocha test with an ASCII plot timeline of the memory usage][demo]

## Install

```bash
npm i git+https://github.com/nicholawmin/memstat.git
```

## Usage

```js
const memstat = Memstat()

// run a potentially leaky function 200 times
for (let i = 0; i < 200; i++)
  await memstat.sample(() => myLeakyFunction(2, 3))

const usage = memstat.end()

console.log(usage.plot) // print an ASCII allocation timeline plot

console.log(usage.increasePercentage) // 200, percentage of increase
console.log(usage.initial) // 10000 (bytes), initial heap size
console.log(usage.current) // 20000 (bytes) current heap size
console.log(usage.snapshots) // [10000, 12340, 13100, ....]
```

### Mocha

This is made for Mocha tests.

Pass the test context (`this`) to `memstat.end()` and the plot will draw on
failed tests:

```js
describe ('when run 100 times', function() {
  it ('does not leak memory', async function() {
    for (let i = 0; i < 200; i++)
      await memstat.sample(() => leakyFunction(2, 3))

    const usage = memstat.end(this)

    expect(usage.percentageIncrease).to.be.below(10)
    expect(usage.current).to.be.below(1024 * 1024 * 100) // 100 MB
  })
})
```

## Watch mode

To observe realtime heap statistics:

```js
import Memstat from 'memstat'

Memstat({ watch: true })
```

which does this:

![Animation showing live memory usage plotting in terminal][watch-demo]


## Test

```bash
npm test
```

### Notes

- Make sure you [don't use arrow functions][no-mocha-arrow]   
  in `describe`/`it`, otherwise `this` will be undefined.
  Using arrow functions in Mocha is in fact discouraged.  
- Make sure you `await memstat.sample(() => functionUnderTest())`

Heap size is the value of [v8.getHeapStatistics()][v8-heap-doc]

### License

> 2024 Nik Kyriakides, [@nicholaswmin][wmin]

> The MIT License

> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:

[wmin]: https://github.com/nicholaswmin
[test-workflow-badge]: https://github.com/nicholaswmin/memstat/actions/workflows/tests.yml/badge.svg
[v8-heap-doc]: https://nodejs.org/api/v8.html#v8getheapstatistics
[demo]: .github/docs/demo.png
[watch-demo]: .github/docs/watch-demo.gif
[no-mocha-arrow]: https://github.com/meteor/guide/issues/318
