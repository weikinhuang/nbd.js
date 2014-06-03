# nbd/Promise

* [new Promise()](#constructor-callback-)
* [resolver.resolve()](#resolverresolve-x-)
* [resolver.fulfill()](#resolverfulfill-value-)
* [resolver.reject()](#resolverreject-reason-)
* [.then()](#then-onfulfilled-onrejected-)
* [.done()](#done-onfulfilled-onrejected-)
* [.catch()](#catch-onrejected-)
* [.finally()](#finally-onsettled-)
* [.thenable()](#thenable-)
* [.promise()](#promise-)
* [.spread()](#spread-onfullfilled-onrejected-)
* [.get()](#get-name-)
* [.set()](#set-name-value-)
* [.delete()](#delete-name-)
* [.send()](#send-name-args-)
* [.fcall()](#fcall-args-)

* [Promise.of()](#promiseof-value-)
* [Promise.from()](#promisefrom-value-)
* [Promise.resolve()](#promiseresolve-value-)
* [Promise.reject()](#promisereject-value-)
* [Promise.race()](#promiserace-args-)
* [Promise.all()](#promiseall-args-)
* [Promise.join()](#promisejoin-p1-p2-)
* [Promise.isPromise()](#promiseispromise-value-)
* [Promise.isThenable()](#promiseisthenable-value-)

Promises are one of the most useful patterns in JavaScript for dealing with the
asynchronous nature of the language. It helps separate concerns and gives the
generic JavaScript callback more context.
**nbd.js**'s `Promise` is an implementation of [Promises/A+][a-plus] spec. In
addition to the core spec, it also implements as much of the [ES6 Draft
Spec][es6-draft] as possible, including methods from the current [ECMAScript
Strawman][strawman]. It aims to provide as smooth a transition as possible
for the eventual inclusion of native Promises.

[a-plus]: http://promises-aplus.github.io/promises-spec/
[es6-draft]: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
[strawman]: http://wiki.ecmascript.org/doku.php?id=strawman:promises

## `constructor( [callback] )`

Creates an instance of `Promise`, with the optional `callback({ resolve(),
fulfill(), reject() })`. If the `callback` function is provided, it is
immediately invoked with the instance of `PromiseResolver` that controls the
constructed `Promise`.

```javascript
var promise = new Promise(function(resolver) {
  resolver.resolve('bar');
});

promise.then(function(foo) {
  console.log(foo); // will be 'bar'
});
```

Calling the constructor directly (i.e. without use of `new`) will have the same
effect as instanciating with `new`.

If the `callback` is not provided, the `PromiseResolver`'s `resolve()` and
`reject()` methods are attached to the instance of `Promise`, so that the
promise can be resolved by itself.

```javascript
var promise = Promise();
promise.reject('error');
// Will warn 'error'
promise.then(console.info, console.warn);
```

# PromiseResolver

This class is only exposed through the callback to a `Promise` constructor. It
serves as the object to settle the state of its associated `Promise`.

## `resolver.resolve( x )`

Primary method for resolving a promise's state. If no errors occur, the promise
will be fulfilled with the value of `x`. Otherwise, the promise will be
rejected.

If `x` is another promise or a then-able pseudo-promise (has the method
`.then()` with the same signature), then the current promise will resolve with
the same state and value as `x`.

Nothing happens if `.resolve()` is called on a promise that's already
been resolved.

## `resolver.fulfill( value )`

Immediately fulfills the promise with `value`. The `value` may be another
promise.

Similar to `.resolve()`, nothing happens if it is called on a promise that's
already been resolved.

## `resolver.reject( reason )`

Outright rejects a pending promise. The promise will be rejected with the
reason `reason`.

Similar to `.resolve()`, nothing happens if it is called on a promise that's
already been resolved.

# Promise.prototype

## `.then( onFulfilled, onRejected )`

Binds `onFulfilled` and `onRejected` functions to the promise's fufilled and
rejected states. The bound functions, when the promise is still pending, will
not be called until the promise is resolved. If called after the promise is
resolved, the parameters will be called immediately, after `.then()` returns.

All callback functions will be called as functions, i.e. they will not be
called with any context. `.then()` itself is context-independent: it can be
called with any context.

**returns** *Promise* A new promise object that will resolve with the
fulfilled/rejected state and value of the return values of `onFulfilled` or
`onRejected`, respectively.

## `.done( onFulfilled, onRejected )`

Similar to `.then()`, but exposes any uncaught errors as uncaught exceptions.
Usually during a promise chain resolution, all errors are caught and translated
as rejections of the promise chain. However this runs into scenarios when
errors go undetected. `.done()` will translate rejections back into a thrown
error.

*Note* An error thrown by `.done()` is **uncatchable**.

## `.catch( onRejected )`

Binds only `onRejected` to the promise. Semantically equivalent to

    promise.then(null, onRejected);

**returns** *Promise*

## `.finally( onSettled )`

Binds `onSettled` to any settled state of the promise. Semantically equivalent
to

    promise.then(onSettled, onSettled);

**returns** *Promise*

## `.thenable()`

Creates a then-able pseudo-promise object with a single member, the `then()`
that operates on the current promise. This then-able is useful to give only the
ability to add fulfill and reject callbacks without giving any other
functionality.

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

  $.when( inst1, inst2 )
  .done(function( retVal1, retVal2 ) {
    console.log( retVal1, retVal2 );
  });

  inst1.resolve( 'foo' );
  // nothing happens

  inst2.resolve( 'bar' );
  // console logs: foo bar

});
```

**returns** *Object* jQuery Deferred-compatible object

# Promise-for-Array

## `.spread( onFulfilled, onRejected )`

The promised value is assumed to be an Array. This value is applied to the
`onFulfilled` function as its arguments when the promise resolves.

```javascript
var promise = new Promise();
promise.resolve([0, 1, 2]);
promise.spread(function(zero, one, two) {
  console.log(arguments.length); // 3
});
```

**returns** *Promise*

# Promise-for-Object

## `.get( name )`

The promised value is assumed to be an Object. The returned promise is
fulfilled with the `name` property of the promised value when it resolves.

```javascript
var promise = new Promise();
promise.resolve({
  foo: 'bar'
});
promise.get('foo')
.then(function(foo) {
  console.log(foo); // 'bar'
});
```

**returns** *Promise*

## `.set( name, value )`

The promised value is assumed to be an Object. The returned promise is
fulfilled with the same value, but with the `name` property changed to `value`.

```javascript
var promise = new Promise();
promise.resolve({
  foo: 'bar'
});
promise.set('foo', 'baz')
.then(function(o) {
  console.log(o.foo); // 'baz'
});
```

**returns** *Promise*

## `.delete( name )`

The promised value is assumed to be an Object. The returned promise is
fulfilled with the same value, but with the `name` property deleted.

```javascript
var promise = new Promise();
promise.resolve({
  foo: 'bar'
});
promise.delete('foo')
.then(function(o) {
  console.log(o.foo); // undefined
});
```

**returns** *Promise*

## `.send( name, ...args )`

The promised value is assumed to be an Object. The property `name` of that
object is assumed to be a function. The returned promise is resolved with the
return value of the function called with `args` as its arguments.

```javascript
var promise = new Promise();
promise.resolve({
  sum: function(a, b) { return a + b; }
});
promise.send('sum', 12, 30)
.then(function(val) {
  console.log(val); // 42
});
```

**returns** *Promise*

# Promise-for-Function

## `.fcall( ...args )`

The promised value is assumed to be a Function. The returned promise is
resolved with the return value of the function called with `args` as its
arguments.

```javascript
var promise = new Promise();
promise.resolve(function sum(a, b) {
 return a + b;
});
promise.fcall(12, 30)
.then(function(val) {
  console.log(val); // 42
});
```

**returns** *Promise*

# Promise methods

## `Promise.of( value )`

Generates a fulfilled promise with `value`. `value` can be another promise.
Differs from `Promise.from()` by not detecting whether or not `value` is a
promise or a thenable. Treats all `value` equally.

**returns** *Promise*

## `Promise.from( value )`

Coerces `value` into a promise. If `value` is a promise, it is returned as-is.
If `value` is a *thenable*, it is converted into a promise, taking on the state
and value of the thenable.

**returns** *Promise*

## `Promise.resolve( value )`

Generates a resolved promise with `value` as its resolution. Differs from
`Promise.from()` by not checking if `value` is a promise. Will convert
*thenable* into a promise, taking on its state and value.

**returns** *Promise*

## `Promise.reject( value )`

Generates a rejected promise with `reason` as its resolution.

**returns** *Promise*

## `Promise.race( ...args )`

Creates a promise that will resolve or reject as soon as the first element of
`args` settles into either fulfilled or rejected state. The returned promise
value will be the value of the first settled promise.

All elements of `args` are coerced into promises.

**returns** *Promise*

## `Promise.all( ...args )`

Creates a promise that will resolve as soon as all elements of `args` have
resolved, or will reject as soon as the first element rejects. The returned
promise value will be an array of resolved values.

All elements of `args` are coerced into promises.

**returns** *Promise*

## `Promise.join( p1, p2 )`

Returns a *thenable* that waits on both `p1` and `p2`. Both `p1` and `p2` are
assumed to be *thenable*s.

**returns** *thenable*

## `Promise.isPromise( value )`

Checks if `value` is a `Promise`. Relies on `instanceof`.

**returns** *boolean*

## `Promise.isThenable( value )`

Checks if `value` is a *thenable*. A *thenable* is an object with the property
`then` that is a function.

**returns** *boolean*
