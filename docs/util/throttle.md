# nbd/util/throttle

* [()](#-promisegenerator-)

Throttles calls based on an asynchronous promise return.

## `( promiseGenerator )`

`promiseGenerator` is assumed to be a function that is called by `throttle`,
and if the return value is a *thenable*, further calls to `throttle` of
`promiseGenerator` are throttled until the *thenable* settles.

**returns** *retval* Return value from calling `promiseGenerator` _or_
`undefined` due to being throttled.
