[![test-workflow][test-workflow-badge]][ci-test]

# heapstats

A terminal-based [heap allocation][gc-wiki] plotter for [Node.js][node]

Plots memory usage & garbage collection stats by [V8][v8]'s
[trace-based][tracing-gc-wiki] GC

![Mocha test results showing memory usage as an ASCII timeline plot][demo-img]

## Install

```bash
npm i heapstats
```

## Usage

### Testing functions

Run a [leaky-prone function][leaky-func-sync] 100 times & check if it leaks:

```js
import Heapstats from 'heapstats'

const heap = Heapstats()

for (let i = 0; i < 100; i++)
  heap.sample(() => addTwoNumbers(5, 3))

console.log(heap.stats().plot)
```

### Testing async functions

Same as above but this time it's an [async function][leaky-func-async]:

```js
import Heapstats from 'heapstats'

const heap = Heapstats()

for (let i = 0; i < 100; i++)
  await heap.sample(() => addTwoNumbers(5, 3))

console.log(heap.stats().plot)
```

Assuming it does leaks memory, you'll see something like this:

```text
                      Heap Allocation Timeline

Cur: 21.79 MB
Max: 56.77 MB              Heap increased: 376%
      ╷
56.77 ┼                                 ╭─╮                                 
45.62 ┤                            ╭────╯ │    ╭────╮     ╭────╮   
34.46 ┤                      ╭─────╯      ╰────╯    │  ╭──╯    │
23.31 ┤            ╭────╮  ╭─╯                      ╰──╯       ╰─  
12.15 ┤       ╭────╯    ╰──╯                                       
 1.00 ┼───────╯                                                             
      ┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬──

Initial: 4.57 MB                                   GC Cycles: 27
```

### Testing an indeterminate process

When testing something indeterminate, like an HTTP request, just
instantiate it, do whatever work needs to be done and then get `.stats()`
as usual.

For example:

```js

const heap = Heapstats()

app.get('/users', (req, res) => {
  const users = await leakyDatabaseCall()

  res.json(users)

  console.log(heap.stats().plot)
})
```

It starts collecting memory stats when you instantiate it - that is *if* a
garbage collection/compaction actually takes place.

No need to call `sample(() => someFunction())` in this case.

### Heap statistics

Apart from the ASCII plot, `heap.stats()` returns:

```js
{
   // heap size on instantiation
  "initial": 4.50,

  // heap size now
  "current": 21.30,

  // max. heap size reached
  "max": 32.00,

   // diff. of initial and current, expressed as %
  "increasePercentage": 2.4,

   // collected stats of each garbage collection
  "snapshots": [V8HeapStats, V8HeapStats ...]
}
```

sizes are in megabytes (MB).  

A `V8HeapStats` object contains garbage collection statistics as captured by
[v8.getHeapStatistics()][v8-heap-doc].  

For more info about garbage collection in [V8][v8], [read here][oil].

## As a unit-testing utility

In [Mocha][mocha], you can pass the test context like so:

```js

Heapstats({ test: this })
```

the plot will auto-draw next to its test - but only if the test **fails**.


```js
describe('#addTwoNumbers() - memory profiling', function() {

  beforeEach(async function() {
    this.heap = Heapstats({ test: this }) // pass `test: this`

    for (let i = 0; i < 200; i++)
      this.heap.sample(() => addTwoNumbers(2, 3))
  })

  it ('does not leak memory', function() {
    expect(this.heap.stats().current).to.be.below(10)
  })

  it ('does not exceed 100 MB in memory usage', function() {
    expect(this.heap.stats().max).to.be.below(100)
  })

  it ('has not increased by more than 2%', function() {
    expect(this.heap.stats().increasePercentage).to.be.below(2)
  })

  // ... and so on ...
})
```

> [!IMPORTANT]  
> Avoid arrow functions/lambdas in Mocha `describe`/`it` callbacks, otherwise
> `this` would be lexically bound to the wrong value. Mocha itself heavily
> [discourages their use][no-mocha-arrow].  

## Tail mode

To observe realtime heap statistics:


```js
import Heapstats from 'heapstats'
```

and start with flag `--heapstats`, i.e:

```bash
node app.js --heapstats
```

![animation of realtime memory usage as a line plot, in terminal][tail-img]

## Configuration

```js

const heap = new Heapstats({
  // plot size
  window: { columns: 100, rows: 25 },

  // test context, if used with mocha
  test: this,

  // draw plot if test ends in:
  plotOnTest: ['passed', 'failed']
})
```

## Test

```bash
npm i
```

then:

```bash
npm test
```

To run a specific test in isolation, i.e `stats.spec.js`:


```bash
npx mocha test/stats.spec.js --no-package --global leak
```

## Gotchas

### Just avoid profiling

Modern GC's don't have concrete rules on when to run and how to run.  
Their method of operation is intentionally abstracted from the user (you)
for a good reason so messing with it when testing is almost certain to make
your unit tests [brittle and flaky][brittle].

I only wrote this because I needed a visual way to triage unit-tests when I was
messing with [Streams][streams], which have explicit resource acquisition
and release steps.

### Flatlined stats

Garbage Collectors won't run if you're using (or abusing) small-ish
amounts of memory regardless if whatever you're doing is actually causing
a leak.

In these cases you'll see a flatlined plot and a low number of
`heap.stats().snapshots.length`.

There's always a bit of a weird dilemma in figuring out if there's no leak or
if the GC has simply not kicked in yet.

The best way to go about it is to setup your test in a way that really
stresses the function under test and wait for a cycle. This means you
should run your function `n` amount of times, not just once. The `n` here
can easily mean tens of thousands or even millions of iterations.

If your function is expected to use *some* memory, the GC will **have to**
eventually kick in to deallocate it - there's no other way to manually
deallocate memory in the language.

If you're not seeing a cycle being logged and you're impatient about the whole
thing, you can always just force the GC to run by calling `global.gc()`.

### Don't trust single cycles

I've never seen a real memory leak where memory usage increases monotonically
and linearly until it eventually runs out of memory.

A real memory leak, the kind that could happen in your actual production system,
will usually present itself in a ["seesaw" pattern][leak-pattern].

This means a GC cycle takes place, memory usage drops - but it just doesn't
quite drop entirely back to baseline.  

There's always just a little bit extra being held after each cycle.

It's only when you project this effect over an extended period of time that you
can clearly tell that it's a leak.

Don't rely on the results of just 1 cycle.

## License

> © 2024 Nicholas Kyriakides
>
> The MIT No Attribution License  
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software *without restriction*, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so.


[test-workflow-badge]: https://github.com/nicholaswmin/memstat/actions/workflows/tests.yml/badge.svg
[ci-test]: https://github.com/nicholaswmin/heapstats/actions/workflows/tests.yml
[demo-img]: https://raw.githubusercontent.com/nicholaswmin/mine/main/public/heapstats/assets/demo.png
[tail-img]: https://raw.githubusercontent.com/nicholaswmin/mine/main/public/heapstats/assets/demo-tail.gif

[nicholaswmin]: https://github.com/nicholaswmin
[async-func]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[await]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
[node]: https://nodejs.org/en
[v8]: https://v8.dev/
[oil]: https://v8.dev/blog/oilpan-library
[gc-wiki]: https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)
[tracing-gc-wiki]: https://en.wikipedia.org/wiki/Tracing_garbage_collection
[v8-heap-doc]: https://nodejs.org/api/v8.html#v8getheapstatsistics
[mocha]: https://mochajs.org/
[no-mocha-arrow]: https://mochajs.org/#arrow-functions
[sampling]: https://en.wikipedia.org/wiki/Sampling_(statistics)
[gc-update]: https://v8.dev/blog/trash-talk

[mocha-example]: .github/examples/mocha.spec.js
[leaky-func-sync]: .github/examples/basic.js#L7-L14
[leaky-func-async]: .github/examples/basic-async.js#L7-L14

[streams]: https://nodejs.org/en/learn/modules/backpressuring-in-streams
[ee]: https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter
[stream-handling]: https://github.com/nodejs/help/issues/1979
[brittle]: https://softwareengineering.stackexchange.com/a/356238/108346
[leak-pattern]: https://www.researchgate.net/figure/Linearly-increasing-memory-leak-pattern_fig2_352479475

[memlab]: https://engineering.fb.com/2022/09/12/open-source/memlab/
[node-memwatch]: https://github.com/airbnb/node-memwatch
