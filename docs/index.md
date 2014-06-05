# Modules

1. [First class modules](#first-class-modules)
2. [MVC modules](#mvc-modules)
3. [Traits](#traits)
4. [Utilities](#utilities)

## First class modules

First class modules are modules that exist at the top level of **nbd.js**
because they offer basic mechanics that are useful in a variety of situations

* [Class](Class.md)
* [Logger](Logger.md)
* [Promise](Promise.md)

## MVC modules

All MVC modules are Class constructors. I.e. they are Classes that are intended
to be instanciated with `new`.

* [Model](mvc/Model.md)
* [View](mvc/View.md)
  * [View/Entity](mvc/View/Entity.md)
  * [View/Element](mvc/View/Element.md)
* [Controller](mvc/Controller.md)
  * [Controller/Entity](mvc/Controller/Entity.md)
  * [Controller/Responsive](mvc/Controller/Responsive.md)

## Traits

Traits are simply objects meant to be `extend()`ed into existing objects or `.mixin()`ed into Classes.

* [trait/log](trait/log.md)
* [trait/promise](trait/promise.md)
* [trait/pubsub](trait/pubsub.md)

## Utilities

Utilities are usually functions meant to be run by themselves. However some utility functions have extra functionality attached.

* [util/async](util/async.md)
* [util/construct](util/construct.md)
* [util/curry](util/curry.md)
* [util/deparam](util/deparam.md)
* [util/diff](util/diff.md)
* [util/extend](util/extend.md)
* [util/media](util/media.md)
* [util/pipe](util/pipe.md)
* [util/throttle](util/throttle.md)
