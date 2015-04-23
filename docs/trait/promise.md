# nbd/trait/promise

The `promise` trait is the trait form of [`nbd/Promise`](../Promise.md). This
allows [`nbd/Class`](../Class.md) subclasses to `.mixin()` the trait, to make
instances of those classes to become Promise-like objects.

The trait itself is also a promise class. This means it can be instanciated
with `new` to produce a promise.

[1]: http://promises-aplus.github.io/promises-spec/

## `.then(onFulfilled, onRejected)`

Binds `onFulfilled` and `onRejected` functions to the promise's fufilled and
rejected states. THe bound functions, when the promise is still pending, will
not be called until the promise is resolved. If called after the promise is
resolved, the parameters will be called immediately, after `.then()` returns.

All callback functions will be called as functions, i.e. they will not be
called with any context.

**returns** *promise* A new promise object that will resolve with the
fulfilled/rejected state and value of the return values of `onFulfilled` or
`onRejected`, respectively.

## `.catch(onRejected)`

Trait method for specifying only the reject handler. This is semantically
equivalent to

    this.then(null, onRejected);

**returns** *promise*

## `.finally(onSettled)`

Trait method for specifying the same handler for both the fulfilled and
rejected states. This is semantically equivalent to

    this.then(onSettled, onSettled);

**returns** *promise*

## `.resolve(x)`

Primary method for resolving a promise's state. If no errors occur, the promise
will be fulfilled with the value of `x`. Otherwise, the promise will be
rejected.

If `x` is another promise or a then-able pseudo-promise (has the method
`.then()` with the same signature), then the current promise will resolve with
the same state and value as `x`.

Nothing happens if `.resolve()` is called on a promise that's already
been resolved.

**returns** *nothing*

## `.reject(reason)`

Outright rejects a pending promise. The promise will be rejected with the
reason `reason`.

Similar to `.resolve()`, nothing happens if it is called on a promise that's
already been resolved.

**returns** *nothing*

## `.thenable()`

Creates a then-able pseudo-promise object with a single member, the `then()`
that operates on the current promise. This then-able is useful to give only the
ability to add fulfill and reject callbacks without also giving the ability to
resolve.

This `then()` method is context-independent: it can be called from any context
and the promise it applies to remains the same.

**returns** *Object* Then-able promise-like object

## `.promise()`

Creates an object with the `done()`, `fail()`, `progress()`, `then()` and
`promise()` methods. This object is used for interoperability with jQuery's
Deferred objects. Instances with the `promise` trait can give their
`.promise()` returns to `jQuery.when()` for creating a single promise out of
many.

```javascript
require(['nbd/Class', 'nbd/trait/promise', 'jquery'],
function(Class, promise, $) {

  var Delayed = new Class.extend().mixin(promise),
  inst1 = new Delayed(),
  inst2 = new Delayed();

  $.when(inst1, inst2)
  .done(function(retVal1, retVal2) {
    console.log(retVal1, retVal2);
  });

  inst1.resolve('foo');
  // nothing happens

  inst2.resolve('bar');
  // console logs: foo bar

});
```

**returns** *Object* jQuery Deferred-compatible object
