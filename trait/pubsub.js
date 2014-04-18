/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../util/curry'], function(curry) {
  'use strict';

  // Regular expression used to split event strings
  var slice = Array.prototype.slice,
  eventSplitter = /\s+/,

  splitCaller = curry.bind(function(fn, map) {
    if (map == null) {
      fn.apply(this, slice.call(arguments, 1));
      return this;
    }

    var rest = slice.call(arguments, 2),
        keys = typeof map === 'object' ?  Object.keys(map) : [map],
        front = [],
        event, i;

    for (i = 0; i < keys.length; ++i) {
      event = keys[i].split(eventSplitter);
      if (typeof map === 'object') {
        front[1] = map[keys[i]];
      }
      while ((front[0] = event.shift())) {
        fn.apply(this, front.concat(rest));
      }
    }
    return this;
  }),

  addEntry = function(event, callback, context, once) {
    if (!this._events) {
      Object.defineProperty(this, '_events', {
        configurable: true,
        value: {},
        writable: true
      });
    }

    (this._events[event] || (this._events[event] = [])).push({
      fn: callback,
      ctxt: context,
      self: this,
      once: once
    });

    return this;
  },

  triggerEntry = function(entry, index, array) {
    entry.fn.apply(entry.ctxt || entry.self, this);
    if (entry.once) { array.splice(index, 1); }
  },

  uId = function uid(prefix) {
    uid.i = uid.i || 0;
    return (prefix || '') + (++uid.i);
  };

  return {
    on: splitCaller(function(event, callback, context) {
      if (!callback) { return this; }
      return addEntry.call(this, event, callback, context);
    }),

    one: splitCaller(function(event, callback, context) {
      if (!callback) { return this; }
      return addEntry.call(this, event, callback, context, true);
    }),

    off: splitCaller(function(event, callback, context) {
      var calls, events, i;

      function entryTest(entry) {
        return (callback && entry.fn !== callback) ||
          (context && entry.ctxt !== context);
      }

      // No events, or removing *all* events.
      if (!(calls = this._events)) { return this; }
      if (!(event || callback || context)) {
        delete this._events;
        return this;
      }

      events = event ? [event] : Object.keys(calls);
      for (i = 0; i < events.length; ++i) {
        if ((event = events[i]) && calls[event]) {
          calls[event] = calls[event].filter(entryTest);
          if (!calls[event].length) {
            delete calls[event];
          }
        }
      }
    }),

    trigger: splitCaller(function(event) {
      if (!this._events) { return this; }
      var events = this._events[event],
          all = this._events.all;

      if (events) { events.forEach(triggerEntry, slice.call(arguments, 1)); }
      if (all) { all.forEach(triggerEntry, arguments); }

      return this;
    }),

    // An inversion-of-control version of `on`. Tell *this* object to listen to
    // an event in another object ... keeping track of what it's listening to.
    listenTo: function(object, events, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = object._listenerId || (object._listenerId = uId('l'));
      listeners[id] = object;
      object.on(events, callback || this, this);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(object, events, callback) {
      var listeners = this._listeners;
      if (!listeners) { return this; }
      if (object) {
        object.off(events, callback, this);
        if (!(events || callback)) { delete listeners[object._listenerId]; }
      }
      else {
        for (var id in listeners) {
          listeners[id].off(null, null, this);
        }
        this._listeners = {};
      }
      return this;
    }
  };
});
