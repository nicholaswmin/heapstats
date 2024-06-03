
### Gotchas

This plotter doesnt suggest going all-out with memory profiling while you're
unit-testing.

I regularly have to deal with code that requires creating my own streams and
their interfaces - streams are just downright nasty when it comes to weird
error-handling - you're never too sure if what you've assembled is a
JSON compressor or a homemade pipe-bomb.

In those cases, being able to quickly plot a failing test case helps a lot
because memory leaks have a very characteristic shape when plotted as a
time-series. In most other cases, memory profiling when unit-testing is
just pointless.

#### Mocha and arrow functions dont mix

Mocha makes heavy use of the lexical scope - `this` context is used
for everything, from configuration to grouping test scenarios.
Arrow functions (lambdas), rescope `this` - that's their whole point.

This tool requires `this` to be passed when unit testing so it can
figure out when a test has elapsed - so avoid arrow functions in
`describe` and `it` handlers.

#### Avoid global setup/teardown handlers

Top-level `before`/`after`, `afterEach`... and so on, tend to create weird
context. These issues are magnified when you're synthetically creating
memory leaks as you're 100% guaranteed to taint the results of one test case
from the leaks created in another - unless you use the test runner the way it's
meant to be used.

Keep test cases isolated from each other. Wrap everything in a `describe`.
