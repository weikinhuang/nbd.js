# nbd/View
  *extend* [nbd/Class](../Class.md)
  *mixin* [nbd/trait/pubsub](../trait/pubsub.md)

Events:
* __prerender__
* __postrender__ : `(this.$view)`

This is the highest-level generic View class, meant for managing a DOM node.
Obviously, jQuery is the biggest intended audience, but `View` will normalize
the DOM API in addition to jQuery-like APIs like Zepto.

## `constructor([model])`

When handed an optional `model`, it is attached to the view instance as
`._model`. Otherwise, it is defaulted to an empty object.

## `.templateData()`

Provides a sensible default for templating. If the instance uses an
`nbd/Model`, then it returns `this._model.data()`. Otherwise, it returns
`this._model`

This is so that by default, without further overriding `.templateData()`, any
calls to `.render()` will provide the `.template()` function with the most
useful data it can.

**returns** *Object*

## `.template(templateData)`

The templating function. This function by default is a stub. Subclasses should
override it with a function that returns HTML that is to be parsed and assigned
to `this.$view`. Essentially, this function serves as the point of
transformation from the results of `.templateData()` into HTML to be available
as `this.$view`.

```js
define(['nbd/View'], function(View) {

  function templater(data) {
    return '<div><a href="'+data.url+'">'+data.label+'</a></div>';
  }

  var view = new View();
  view.template = templater;
  return view;
});
```

**returns** *String* The intended HTML content of `this.$view`

## `.render([$parent])`

The rendering behavior depends on whether or not the `Entity` has already been
rendered (i.e. `this.$view` exists), and whether or not `.render()` was called
with a parent element.

If a parent element was provided, then `.render()` will render (append) the
contents as a child element of the parent. If the view has never been rendered
before, it will be rendered then (`.template()` will be called). Otherwise, the
existing element will simply be re-appended to the parent element.

If `.render()` was called without a parent element, then it will only replace
the existing element with a newly rendered element. Nothing happens if the view
has never been rendered before.

In all cases, only when a new view renders will the **prerender** and
**postrender** events fire.

**returns** The rendered `this.$view`

## `.destroy()`

The destructor function removes `this.$view` object if it's been rendered. It
also unbinds any bindings to the rendering events.

# Hooks

`View` also has several method hooks for easy access to its lifetime events

## `.prerender()`

Automatically called on `prerender` event, before any templating occurs. This
hook is skipped if no new HTML was generated.

## `.postrender($view)`

Automatically called on `postrender` event, after templating and attachment to
DOM. This hook is skipped if no new HTML was generated.

## `.rendered($view)`

Deprecated hook for backward compatibility. Alias of the `postrender` hook.

# View Nesting

`nbd/View` has the ability to nest other views, or any other object with
`.render($container)` signature. This is done through a declarative syntax with
the `.nests` property.

## `.nests`

Object map where the keys are the keys of the model and values are selectors.

For example,

```js
View.extends({
  nests: {
    'foo': '.bar'
  }
});
```

Would declare a nesting of whatever resides at `this._model.get('foo')` and
insert it into `View.find(this.$view, '.bar')`. Furthermore, the declarative
`.nests` syntax is automatically bound to the model when the model is an
`nbd/Model`. By changing the model, it will change the nested content
automatically.

If the model property is meant to be nested inside the top level `this.$view`,
use an empty string or `null` as the selector.

# View static helpers

These `View` static helper methods are there to normalize the API of both the
DOM and jQuery-like abstraction layers. This way, **nbd.js** can operate
independently of the various API differences.

## `View.domify(html)`

Takes in `html` string and converts it into a DOM Element. This operation
requires access to the DOM. Only the first element will be returned from the
parsed HTML.

**returns** *DOMElement* Parsed DOM Element

## `View.appendTo(child, parent)`

Appends `child` element to `parent` as the last member of `parent.childNodes`.

**returns** *Element* A reference to `child`

## `View.find(root, selector)`

Finds the first child element of `root` by a CSS `selector`.

**returns** *Element*

## `View.replace(old, new)`

Replaces `old` element with `new`. Its position is preserved.

**returns** *Element* A reference to `old`

## `View.remove(element)`

Removes `element` from `element.parentNode.childNodes`.

**returns** *Element* A reference to `element`
