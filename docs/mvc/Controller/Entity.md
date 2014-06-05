# nbd/Controller/Entity
  *extends* [nbd/Controller](../Controller.md)

* [new Entity()](#constructor-id-data-)
* [.requestView()](#requestview-viewclass-)
* [.render()](#render-parent-viewclass-)
* [.destroy()](#destroy)
* [Entity.MODEL_CLASS](#entitymodel_class)
* [Entity.VIEW_CLASS](#entityview_class)

The concept of a `Controller` in **nbd.js** is one that is more akin the
classic definition of a controller in MVC, rather than a route, as implied by
the majority of other JS front-end frameworks.

The `Controller` is one of the three pieces that represents a conceptual
entity. Whereas the `Model` is the underlying data representation, and the
`View` is the visual representation, the `Controller` is the handler that
controls the relationship between models and views. In addition, it is also
the representation of that entity to the rest of the codebase. Any external
requests to manipulate an entity should do so through the API declared by an
entity's `Controller`.

## `constructor( [id, ]data )`

Constructs the Entity using provided `data`. All the arguments are passed
through to the `Model` to construct the model. The model is then used to
construct the `View`.

At the end of the constructor, there should be two references. `._model` is an
instance of `Entity.MODEL_CLASS`. `._view` is an instance of
`Entity.VIEW_CLASS`.

## `.requestView( ViewClass )`

Checks if the current `._view` is an instance of `ViewClass`, and if not,
replaces it with a new instance of `ViewClass` using
[`.switchView()`](../Controller.md#switchview-viewclass-).

## `.render( [$parent], [ViewClass] )`

Coerces the current `._view` to be an instance of `ViewClass` if provided,
`Entity.VIEW_CLASS` otherwise. Then renders the view with `$parent`.

## `.destroy()`

Destroys all parts of the entity, which means it destroys `._view`, `._model`,
and resets the references.

# Entity properties

## `Entity.MODEL_CLASS`

The class of models to construct for the corresponding entity. By default this
is [nbd/Model](../Model.md). However, any model class may be provided, and the
arguments from the `Entity` constructor will be passed through to the model.

## `Entity.VIEW_CLASS`

The class of views to construct for the corresponding entity. By default this
is [nbd/View/Entity](../View/Entity.md). This view class is expected to accept
a model and to provide a `.render()`.
