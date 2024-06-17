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

A quick word about unit-testing and profiling:

The purpose of this utility is simple.

It allows you to quickly (i.e "visually") triage a failing unit test and
discern false positives from actual leaks.

.. but I'm **not** suggesting you should be doing any kind of profiling.

In fact I think it's really good way to waste your time.

### Avoid profiling in unit tests

There's nothing fun about continuously stopping what you do just to tend to
bitchy, crying and capricious unit tests; the diametrical opposite of how you
want your unit-tests to behave.

It's almost impossible to predict how a modern GC runs - this means you can't
write a good (read deterministic) test for it.
You can try and get clever with it by using tolerances but tolerances have
a direct impact on the accuracy of the test itself. 

I wrote this for prototyping Streams which are virtually ticking timebombs
that could blow up in your face if you even think about not handling some  
particular and oftentimes bizarre error path.  

I cannot imagine any other use case other than that - but if there
is one it's probably best to do this kind of profiling in a more appropriate
testing phase, farther down the road.

Now back to the gotchas:

### No cycles, no stats

The Garbage collector won't run if you're using (or abusing) small-ish
amounts of memory - regardless if whatever you do is causing a leak or not.

Good - that's the last thing you want anyway since collection cycles are
computationally expensive.

However, when testing, this poses a dilemma:

> Is that a leak or is the GC just not running? Hmm... who knows?

In these cases you'll most likely see a flatlined plot and a low number of
`heap.stats().snapshots.length`. That's often entirely normal since the GC
won't waste it's time over a few spilled bytes. If you see a cycle logged
in the bottom-right corner - you guessed it, the GC has run.

That's cool and all but the above dilemma hasn't been resolved.

Instead of getting too philosophical about it, just do this:

### Force a cycle

You can always just force a garbage collection cycle via `global.gc()`.

Has memory usage dropped to baseline? Yes? Then it's not a leak.

Now it does sound pretty stupid to be doing that and calling it "testing" since
you've ended up effectively ordering the GC around - by telling it when to run.  

🤷

You don't need to `--expose-gc` in this case.

This module internally loads contextual runtime flags which expose the
collector - so just do `global.gc()` in your code and you're good to go.

#### Unlogged metrics

The following are important metrics properties which indicate a potential
memory leak yet they aren't logged, for now at least:

- `number_of_native_contexts`
- `number_of_detached_contexts`

These stats come directly from V8 - the internal JIT compiler - they were
exposed recently-"ish" in Node as `v8.getHeapStatistics()`

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
[brittle]: https://abseil.io/resources/swe-book/html/ch12.html
[leak-pattern]: https://www.researchgate.net/figure/Linearly-increasing-memory-leak-pattern_fig2_352479475

[memlab]: https://engineering.fb.com/2022/09/12/open-source/memlab/
[node-memwatch]: https://github.com/airbnb/node-memwatch
