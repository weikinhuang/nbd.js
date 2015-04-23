# nbd/Logger
  *extend* [nbd/Class](Class.md)
  *mixin* [nbd/trait/pubsub](trait/pubsub.md)

Logger provides the ability to contextually log with custom log level support.

## `constructor([name])`

Create a contextual logger with `name` as the context. Produced log messages
appear as events named for their log levels.

```javascript
var logger = new Logger('Hello');
// Fires the 'log' event with Hello as the context and World as the message
logger.log('World');
```

If `name` is non-string, it is assumed to be the contextual container of the
logger instance. This container is inspected to provide the context name from
the container's constructor's name.

For example, an object constructed from a named function will have that
function's name as its context.

```javascript
function Hello() {}

var logger = new Logger(new Hello());
logger.log('World');
```

For non-named functions, the property `displayName` can be assigned to the
constructor function to force a different context name.

```javascript
var anon = function() {},
logger = new Logger(new anon());

anon.displayName = 'Hello';
logger.log('World');
```

## `.destroy()`

Destructor for the logger instance. Any attached log handlers won't be fired.
All operations after `.destroy()` becomes no-op.

## `.levels`

Array of log levels. By default, the log levels are `debug`, `log`, `info`, `warn`, `error`, in that order. The later the log level appears in the array, the "higher" level it is.

The levels automatically correspond to a level function at logger construction time.

```javascript
var CustomLogger = Logger.extend({
  levels: ['low', 'high']
});

var logger = new CustomLogger();
logger.low('produces a "low" message');
logger.high('produces a "high" message');
```

## `.setLevel(level)`

Sets the log level. By default, the log level is the lowest level. By setting
the level to a higher level, all lower levels are swallowed.

```javascript
var logger = new Logger();
logger.setLevel('warn');
logger.info('will not produce a message');
logger.warn('will produce a warn message');
```

## `.attach(handler)`

Attaches a `handler(logLevel, { context, params })` to the logger instance.
`logLevel` is the level at which the message was fired. `context` is the name
of the current context, if one exists. `params` is an array of the rest
parameters the logger message was created with.

## `.remove(handler)`

Removes an attached `handler` function.

## `.log(...messages)`

Special function guaranteed by the `Logger` constructor. If the current class
does not have a `log` level, the `.log()` function will generate a message at
the lowest log level.

## `Logger.get([name])`

Static logger factory function. This generates a `Logger` instance and attaches
the global logger handler to it. Instanciating this way attaches the instance
to a global way of directing messages. By default, [`Logger.console`](#loggerconsole) is attached
to the global handlers.

**returns** _logger_ instance of `Logger`

## `Logger.attach(handler)`

Attaches a handler to the global handlers. This handler will be invoked for all
messages of allowed global levels. By default, these are `debug`, `log`, `info`, `warn`, `error`. The handler has the same signature as [`.attach()`](#attach-handler-).

## `Logger.setLevel(level, handler)`

Changes the global state of messages from individual loggers. By default, these
are `debug`, `log`, `info`, `warn`, `error`. In order to turn off the 'info'
level, `Logger.setLevel('info', false)`;

`handler` can be a function as well as truthy value. When it is a function, it
is invoked with the log message, and expects a truthy value to indicate whether
or not that log level's message should be handled.

This function also accepts an object hash of levels to their values.

```javascript
Logger.setLevel({
  debug: false,
  warn: function(message) {
    return message.context;
  }
});

// Blocked due to log level
Logger.get('foo').debug("won't generate a message");

// Blocked due to context check
Logger.get().warn("won't generate a message either");
```

## `Logger.console()`

Default console handler. Automatically attached to global handlers. This
handler tries to pretty-print the context a gray color.
