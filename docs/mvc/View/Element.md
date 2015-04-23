# nbd/View/Element
  *extends* [nbd/View](../View.md)
  *mixesin* [nbd/trait/pubsub](../../trait/pubsub.md)
  *deprecated*

Events:
* __prerender__
* __postrender__ : `(this.$view)`

The `Element` subclass is another specific View class like
[nbd/View/Entity](Entity.md). Its purpose is different from `nbd/View/Entity`
in that it represents a section of DOM that data should be rendered into.

This class has become deprecated due to the uncommon pattern. There is no
replacement.

## `constructor( $parent )`

Sets `this.$parent` to `$parent`. This allows the `Element` instance to know
where to render data into.

## `render( [data] )`

Renders `data` appended into `this.$parent` using `.template()`. If this view
has already been rendered, then it replaces the existing render. `data` is
optional. If it's not provided, `.templateData()` will be used to provide the
templating data.

**returns** *Element* `this.$view`
