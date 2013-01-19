# Modules

1. [MVC modules](#mvc-modules)
2. [Traits](#traits)
3. [Utilities](#utilities)

## MVC modules

All MVC modules are Class constructors. I.e. they return functions that are intended to be instanciated with `new`.

* [nbd/Class](mvc/Class.md)
* nbd/Model
* nbd/View
  * nbd/View/Entity
  * nbd/View/Element
* nbd/Controller
  * nbd/Controller/Entity

## Traits

Traits are simply objects meant to be `extend()`ed into existing objects or `.mixin()`ed into Classes.

* nbd/trait/pubsub
* nbd/trait/jquery.tmpl

## Utilities

Utilities are usually functions meant to be run by themselves. However some utility functions have extra functionality attached.

* [nbd/util/async](util/async.md)
* nbd/util/diff
* nbd/util/extend
* nbd/util/media
* nbd/util/pipe
* nbd/util/protochain
