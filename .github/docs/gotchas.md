
### Gotchas

This plotter doesnt suggest going all-out with memory profiling while you're
unit-testing. In fact, that's almost certainly a stupid proposition in the
vast majority of cases.

I regularly have to deal with code that requires creating my own streams and
their interfaces; streams are just downright nasty when it comes to weird
error-handling - you're never too sure if what you've assembled is in fact a
JSON compressor or a homemade pipe-bomb.

In my case, having some memory profiling coverage helps; in most others
cases it's probably just a futile pseudo-academic navel-gazing exercise.

### Mocha

#### Mocha and arrow functions dont mix

Mocha makes heavy use of the lexical scope - `this` context is used
for everything, from configuration to grouping test scenarios.

Arrow functions/lambdas are amazing because they do the exact opposite,
they don't bind `this`.

Mocha is not made to use lambdas like that - your tests
might work but you can't use any of Mochas `this.timeout`/`this.slow`...
because an arrow function will not capture it's context.

This tool keeps in line with Mochas convention and also requires passing `this`
in the tests.


#### Make proper use of the setup/teardown handlers

Avoid doing any setup work outside of designated setup/teardown handlers, i.e
`before`/`beforeEach`/`after`/`afterEach`...

Mocha gives each of them a unique context which maps correctly to subsequent
context where the assertions are taking place `describe`/`it`.


#### Avoid global setup/teardown handlers

Avoid use of global setup handlers as well; wrap the entire test file
in a `describe` - Mocha has weird rules when it comes to how it produces
context for `before`/`beforeEach`/`after`/`afterEach` that are scoped outside
of a `describe`.

These trip-ups are especially important when you're planning on synthetically
creating memory leaks - you're 100% guaranteed to taint the results of one
test case from the leaks created in another unless you use Mocha how
it's supposed to be used.

> Bad

```js
describe('test..', () => {
  // might look like it works but actually produces side-effects.
  // Put it in a proper setup handler.
  const heap = Heapstats({ test: this }) // oops, `this` is `undefined` here

  it('does not create memory spikes', () => {
    const stats = heap.stats()
    stats.max.should.be.less.than(10000)

    // ... and so on...
  })
})
```

> Improved but still meh

```js
// this is setup properly using a proper setup handler
// But it's still global ...
beforeEach(function() { // regular functions, good
  this.heap = Heapstats({ test: this }) //`this` is properly defined
  this.stats = heap.stats()
})

describe('test..', function() {
  it('does not create memory spikes', () => {
    this.stats.max.should.be.less.than(10000)

    // ... and so on...
  })
})
```

> Perfect

```js
describe('test..', function() {
  // Non-global, no arrow functions, proper setups
  beforeEach(function() {
    this.heap = Heapstats({ test: this })

    this.leak = ''
    setInterval(leak => {
      this.leak += JSON.stringify(Array.from({ length: 200 }).fill('x'))
    }, 500, this.leak)

    this.stats = heap.stats()
  })

  afterEach(function() {
    // use this to clear your leaks
    this.leak = undefined
    global.gc()
  })

  it('does not create memory spikes', function() {
    this.stats.max.should.be.less.than(10000)

    // ... and so on...
  })
})
```
