nbd.js 1.1 Changelog
===

* `View/Entity` collapses into `View`
 * `View` no longer maintains `.id()`, it will only have the `.id` property with the value of `model.id()` invoked at time of instanciation. Where `model` is the first parameter to the constructor.
 * `View#destroy()` will always retain its `._model` reference. You can no longer infer the state just by inspecting its `._model` property. Similarly, `#destroy(Boolean)` loses its signature due to the inability to define whether or not `View` instances will retain the reference.
* `Controller/Entity` collapses into `Controller`
 * `Controller#render()` returns a promise of `View#render()`. This breaks duck-substitution between `View` and `Controller` in cases where the return value is needed.
