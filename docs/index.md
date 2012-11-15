# Modules

1. [MVC modules][mvc]
2. [Traits][trait]
3. [Utilities][util]

## MVC modules [mvc]

* nbd/Class
* nbd/Model
* nbd/View
  * nbd/View/Entity
  * nbd/View/Element
* nbd/Controller
  * nbd/Controller/Entity

The heart of nbd.js's flexibility and power comes from the class `Class`.
`Class` provides the base functionality from which two main modes of
inheritance are possible: linear (classical), and horizontal (trait).

Linear Inheritance
---

This is the inheritance everybody is familiar with. In JavaScript, linear
inheritance is achieved through the lookup behavior of objects and their
prototypes. `Class` provides the function `Class.extend()` which will set up 
the inheritance chain properly.

```javascript
require(['nbd/Class'], function(Class) {
  var Subclass = Class.extend({
    // prototype properties here
foo: 'bar'
  }, {
    // static properties here
foo: 'baz'
  }),

      instance = new Subclass();

  instance.foo; // 'bar'
  Subclass.foo; // 'baz'
});
```

Horizontal Inheritance
---

Horizontal inheritance is a newer form of inheritance that allows code reuse
by sharing a common trait. nbd.js achieves this through the `.mixin()` function
that all descendants of `Class` have. *Note: `Class` itself does not have
`.mixin()`*

You can `.mixin()` any object into any descendant of `Class`, and all instances
of that class will have access to the mixed-in object's own properties.

```javascript
require(['nbd/Class'], function(Class) {
  var badTrait = {
    corrupt: function() {
      this.foo = 'bad';
    }
  },

  Subclass = Class.extend({
    foo: 'bar'
  }, {
    foo: 'baz'
  }),

  instance = new Subclass();

  Subclass.mixin( badTrait );

  instance.corrupt();
  instance.foo; // 'bad' corrupted!
  Subclass.foo; // 'baz' static properties unaffected
});
```

The primary purpose of horizontal inheritance is to be able to add
functionality at any time regardless of inheritance structure. For example,
`Model` uses `.mixin()` to mix in the `nbd/trait/pubsub` trait in order to gain
the ability to bind and trigger events. The pubsub trait itself is simply a
slightly modified version of Backbone.js's Backbone.Event.

## Traits [trait]

* trait/pubsub
* trait/jquery.tmpl

## Utilities [util]

* util/async
* util/jxon
* util/pipe
* util/protochain
