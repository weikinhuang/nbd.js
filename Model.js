if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './Class',
  './util/async',
  './util/extend',
  './util/diff',
  './trait/pubsub'
], function(Class, async, extend, diff, pubsub) {
  "use strict";

  function copy(a) {
    if (a != null && typeof a === 'object') {
      return Object.getPrototypeOf(a) === Array.prototype ?
        Array.prototype.slice.call(a) :
        extend({}, a);
    }
    return a;
  }

  var dirtyCheck = function(old, novel) {
    if (!this._dirty) { return; }
    if (this._dirty !== true) {
      for (var k in this._dirty) {
        this.trigger(k, this._data[k], this._dirty[k]);
      }
    }
    else if (old) {
      diff.call(this, novel || this._data, old, this.trigger);
    }
    else { return; }

    this._dirty = 0;
  },

  markDirty = function(prop) {
    if (this._dirty !== true) {
      this._dirty = this._dirty || {};
      if (!(prop in this._dirty)) {
        this._dirty[prop] = this._data[prop];
      }
    }
  },

  constructor = Class.extend({
    init: function(id, data) {
      if (typeof id === 'string' && id.match(/^\d+$/)) {
        id = +id;
      }

      if (data === undefined && typeof id === 'object') {
        data = id;
        id = undefined;
      }

      this.id = function() { return id; };

      try {
        Object.defineProperty(this, '_dirty', { value: 0, writable: true });
        Object.defineProperty(this, '_data', {
          enumerable: false,
          configurable: true,
          value: data || {},
          writable: true
        });
      }
      catch (noDefineProperty) {
        // Can't use ES5 Object.defineProperty, fallback
        this._dirty = 0;
        this._data = data;
      }
    },

    destroy: function() {
      this.off();
      this._data = null;
    },

    data: function() {
      var orig = this._data,
          clone = Object.keys(orig).reduce(function(obj, key) {
            return obj[key] = copy(orig[key]), obj;
          }, {});

      if (this._dirty !== true) {
        async(dirtyCheck.bind(this, extend(clone, this._dirty || undefined)));
        this._dirty = true;
      }
      return this._data;
    },

    get: function(prop) {
      var value = this._data[prop];
      if (Object.getPrototypeOf(Object(value)) === Array.prototype) {
        markDirty.call(this, prop);
      }
      return value;
    },

    set: function(values, value) {
      var key, data = this._data;

      if (!this._dirty) { async(dirtyCheck.bind(this)); }

      if (typeof values === "string") {
        markDirty.call(this, values);
        data[values] = copy(value);
        return this;
      }

      if (typeof values === "object") {
        for (key in values) {
          if (values.hasOwnProperty(key)) {
            markDirty.call(this, key);
            data[key] = copy(values[key]);
          }
        }
        return this;
      }
    },

    toJSON: function() {
      return this._data;
    }
  })
  .mixin(pubsub);

  return constructor;
});
