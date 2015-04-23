# nbd/Controller
  *extend* [nbd/Class](../Class.md)
  *mixin* [nbd/trait/pubsub](../trait/pubsub.md)

Events:
* __destroy__

`Controller` is a class that provides the conceptual binding of all three parts
of MVC: Model, View, and Controller. An instance of the controller is meant to
be the representation of the entity, including all public-facing methods of the
entity.

The concept of a `Controller` in **nbd.js** is one that is more akin the
classic definition of a controller in MVC, rather than a route, as implied by
the majority of other JS front-end frameworks.

## `constructor([id,] data)`

Constructs the Controller using provided `data`. All the arguments are passed
through to the `Model` to construct the model. The model is then used to
construct the `View`.

At the end of the constructor, there should be two references. `._model` is an
instance of `Controller.MODEL_CLASS`. `._view` is an instance of
`Controller.VIEW_CLASS`.

## `.id`

Getter shortcut for the model's `.id()` method.

## `.data`

Getter shortcut for the model's `.data()` method. This allows direct data
modification, since `Model#data()` will schedule a diff check.

## `.requestView([ViewClass])`

Checks if the current `._view` is an instance of `ViewClass`, and if not,
replaces it with a new instance of `ViewClass` using
[`.switchView()`](#switchview-viewclass-).

If called without a `ViewClass`, defaults to the instance's `.View` property or
its static `VIEW_CLASS` property.

## `.switchView([ViewClass])`

The public-facing method that calls `._initView()` and swaps out the existing
view instance, if one exists.

All arguments to `.switchView()` are passed to `._initView()` for constructing
the new view instance. The previous view instance, if it exists, is
`.destroy()`ed. In addition, the old view's `.$view` will be the new view's
`.$view`. Finally, `.render()` is called on the new view such that the new view
is re-rendered in place of the old view.

## `.render([$parent], [ViewClass])`

Coerces the current `._view` to be an instance of `ViewClass` if provided,
`Controller.VIEW_CLASS` otherwise. Then renders the view with `$parent`.

**returns** a Promise of the view's render.

## `.destroy()`

Destroys all parts of the entity, which means it destroys `._view`, `._model`,
and resets the references.

Fires `destroy` event.

## `._initModel(ModelClass, ...)`

This method is the default implementation for creating an instance
`ModelClass`. The instanciated model instance is expected to be attached to the
controller instance as `._model`.

All subsequent arguments after `ModelClass` are passed to the `ModelClass`
constructor as arguments.

## `._initView(ViewClass, ...)`

This method is the default implementation for creating an instance of
`ViewClass` such that the instance is attached to the controller instance as
`this._view`. In addition, the controller instance is attached onto the view
instance as `._controller`.

All subsequent arguments after `ViewClass` are passed to the `ViewClass`
constructor as arguments.

# Controller properties

## `Controller.MODEL_CLASS`

The class of models to construct for the corresponding entity. By default this
is [nbd/Model](../Model.md). However, any model class may be provided, and the
arguments from the `Controller` constructor will be passed through to the model.

## `Controller.VIEW_CLASS`

The class of views to construct for the corresponding entity. By default this
is [nbd/View/Controller](../View/Controller.md). This view class is expected to accept
a model and to provide a `.render()`.
