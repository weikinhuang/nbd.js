nbd.js 1.1 Changelog
===

Breaking changes from nbd.js 1.0:

* `event` is removed.
* `Model` clarifies its `.id()` method.
 * In 1.0, it used to be a closure-bound anonymous function. Now it is a
   prototype method.
 * Numeric check on the `id` constructor parameter now accepts all Numerics
   that are not NaN
* `Model` no longer holds a reference to the original object as its `._data`.
  It now uses a `extend()`ed copy in order to avoid object manipulation outside
of its diff check.
* `View/Entity` collapses into `View`.
 * `View` no longer maintains `.id()`, it will only have the `.id` property
   with the value of `model.id()` invoked at time of instanciation. Where
`model` is the first parameter to the constructor.
 * `View#destroy()` will always retain its `._model` reference. You can no
   longer infer the state just by inspecting its `._model` property. Similarly,
`#destroy(Boolean)` loses its signature due to the inability to define whether
or not `View` instances will retain the reference.
* `Controller/Entity` collapses into `Controller`.
 * `Controller#render()` is no longer a passthrough call of all arguments. Only
   the first argument is passed through.
 * `Controller#render()` returns a promise of `View#render()`. This breaks
   duck-substitution between `View` and `Controller` in cases where the return
value is needed.

Additions

* `util/mixin` utility method is similar to `util/extend`, but copies whole
  object property definitions, not just their values.
* `trait/pubsub` gains `#listenOnce()`. Behaves similar to `#listenTo()`, but
  only binds once.
