# nbd/Controller/Responsive
  *extends* [nbd/Controller/Entity](Entity.md)

* [.render()](#render)
* [.requestView()](#requestview-viewclass-)
* [.mediaView()](#mediaview-breakpoint-active-)
* [Responsive.VIEW_CLASS](#responsiveview_class)

A `Controller` that is responsive to breakpoint changes provided by
[`nbd/util/media`](../../util/media.md). This allows the declaration of highly
divergent views without breaking the conceptual guarantee of a single entity.

This way, a single representation (the controller instance) is exposed, but its
variadic view behavior is hidden away.

## `.render()`

Unlike its superclass implementation, calls to `.render()` are directly passed
through to the `._view`, if it exists.

## `.requestView( [ViewClass] )`

Requests that the current `._view` instance be an instanceof `ViewClass` if
provided. Otherwise, `.requestView()` will find the first matching breakpoint
from [`Responsive.VIEW_CLASS`](#responsiveview_class) and coerce the `._view`
to be an instance of it.

*Note* If called without `ViewClass` and there is no matching view class in
`Responsive.VIEW_CLASS`, then `.requestView()` is a no-op. No `._view` will be
created.

## `.mediaView( breakpoint, active )`

The method that is bound to breakpoint change events of `nbd/util/media`. When
entering a breakpoint that corresponds to a property of
[`Responsive.VIEW_CLASS`](#responsiveview_class), requests that class as the
view.

# Responsive properties

## `Responsive.VIEW_CLASS`

Overloading its meaning from
[nbd/Controller/Entity](Entity.md#entityview_class), `Responsive.VIEW_CLASS`
can be an object of classes as well as just a class. The object of classes
should be keyed by breakpoint names corresponding to the breakpoint names of
[`nbd/util/media`](../../util/media.md).

```javascript
media({
  horizontal: 'all and (orientation: landscape)',
  vertical: 'all and (orientation: portrait)',
});

var OrientedEntity = Responsive.extend({}, {
  VIEW_CLASS: {
    horizontal: HorizontalEntityView,
    vertical: VerticalEntityView
  }
});
```
