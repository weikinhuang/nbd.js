# nbd/trait/log

* [.log](#log)

Trait from [`nbd/Logger`](../Logger.md). When it is mixed into a class, makes a
logger instance available to instances of the class.

## `.log`

The `.log` property is actually a getter property that gets an instance of
`Logger` and attaches onto the current instance. In addition, it sets its own
context as the logger's context container.

This allows the `.log` property to behave correctly across prototypes:

```javascript
require(['nbd/Class', 'nbd/trait/log'], function(Class, log) {
  var HelloWorld = Class.extend({}, {
    displayName: 'HelloWorld'
  })
  .mixin(log);

  // By default, console.debug('HelloWorld', 'foobar');
  (new HelloWorld()).log.debug('foobar');
});
```
