# nbd/trait/responsive

Responsive Javascript is handled in **nbd.js** as a trait bound to
`nbd/util/media`. The media module is expected to provide the current state and
the transition events that inform when media queries have changed.

*Note:* In nbd.js 1.0, this used to be a subclass of `Controller/Entity`, but
now has been genericized into a controller trait.

# Usage

`nbd/trait/responsive` is unlike the other traits that **nbd.js** offers in
that it is specifically meant to be mixed into `nbd/Controller` to gain
responsiveness. Responsive controllers are controllers that specify their
`VIEW_CLASS` as a map of media breakpoints to actual classes.

```js
define([
  'nbd/util/media',
  'nbd/Controller',
  'nbd/trait/responsive'
], function(media, Controller, responsive) {
  media({
    small: 'all and max-width(900px)',
    big: 'all and min-width(901px)'
  });

  var Responsive = Controller.extend({}, {
    VIEW_CLASS: {
      small: SmallView,
      big: BigView
    }
  })
  .mixin(responsive);
});
```

In the above example, instances of `Responsive` will always have their view
instance at `._view` coerced to the view class (either `SmallView` or
`BigView`) that that matches the defined media queries.
