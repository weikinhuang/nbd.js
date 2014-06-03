# nbd/View
  *extends* [nbd/Class](../Class.md)
  *mixesin* [nbd/trait/pubsub](../trait/pubsub.md)

* [new View()](#constructor)
* [.render()](#render-data-)
* [.template()](#template-templatedata-)
* [.templateData()](#templatedata)
* [.destroy()](#destroy)
* [View.domify()](#viewdomify-html-)
* [View.appendTo()](#viewappendto-child-parent-)
* [View.replace()](#viewreplace-old-new-)
* [View.remove()](#viewremove-element-)

Events:
* __prerender__
* __postrender__ : `(this.$view)`

This is the highest-level generic View class, meant for managing a DOM node.
Obviously, jQuery is the biggest intended audience, but `View` will normalize
the DOM API in addition to jQuery-like APIs like Zepto.

## `constructor()`

By default, `View` has an empty constructor. Subclasses can extend `View` and
provide their own implementation of what the View should do.

**returns** *View* A new instance of `View`

## `.render( [data] )`

The default `View` rendering function calls `.template()` with the results of
calling `.templateData()`. The results of running the templating function is
stored as `this.$view`. You can then rely on `.render()` to populate
`this.$view`.

You may also override the objected handed to `.template()` by calling
`.render()` with `data`.

If there was an existing object at `this.$view`, it is replaced with the new
`this.$view`.

In addition, there are also two render events fired. **prerender** is fired
before the call to `.template()` and **postrender** is fired afterward. In
addition to the events, if there is a `.rendered()` function, it will be called
with `this.$view`.

**returns** *nothing*

## `.template( templateData )`

The templating function. This function by default is a stub. Subclasses should
override it with a function that returns HTML that is to be parsed and assigned
to `this.$view`. Essentially, this function serves as the point of
transformation from the results of `.templateData()` into the DOM elements to
be available as `this.$view`.

```js define(['jquery', 'nbd/util/pipe', 'nbd/View'], function($, pipe, View) {

  function templater(data) { return '<div><a
href="'+data.url+'">'+data.label+'</a></div>'; }

  return View.extend({ template: templater }); }); ```

**returns** *Element* The intended content of `this.$view`

## `.templateData()`

Overridable method that returns an object to be given to to the `.template()`
function for templating.

**returns** *Object* The data with which to hand to `.template()`

## `.destroy()`

The destructor function removes `this.$view` object if it's been rendered. It
also unbinds any bindings to the rendering events.

**returns** *nothing*

# View helpers

These `View` static helper methods are there to normalize the API of both the
DOM and jQuery-like abstraction layers. This way, **nbd.js** can operate
independently of the various API differences.

## `View.domify( html )`

Takes in `html` string and converts it into a DOM Element. This operation
requires access to the DOM. Only the first element will be returned from the
parsed HTML.

**returns** *DOMElement* Parsed DOM Element

## `View.appendTo( child, parent )`

Appends `child` element to `parent` as the last member of `parent.childNodes`.

**returns** *Element* A reference to `child`

## `View.replace( old, new )`

Replaces `old` element with `new`. Its position is preserved.

**returns** *Element* A reference to `old`

## `View.remove( element )`

Removes `element` from `element.parentNode.childNodes`.

**returns** *Element* A reference to `element`
