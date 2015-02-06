/* istanbul ignore if */
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
      return Array.isArray(a) ? Array.prototype.slice.call(a) :
        a.constructor === Object ? extend({}, a) :
        a;
    }
    return a;
  }

  function isNumeric(n) {
    return !(isNaN(n) || n !== 0 && !n);
  }

  var dirtyCheck = function(old, novel) {
    diff.call(this, novel || this._data, old, this.trigger);
    this._dirty = 0;
  },

  constructor = Class.extend({
    init: function(id, data) {
      if (isNumeric(id)) {
        id = +id;
      }

      if (data === undefined && typeof id === 'object') {
        data = id;
        id = undefined;
      }

      this.get = this.get.bind(this);
      this.set = this.set.bind(this);

      try {
        Object.defineProperties(this, {
          _id: {
            value: id
          },
          _dirty: {
            value: 0,
            writable: true
          },
          _data: {
            enumerable: false,
            configurable: true,
            value: data || {},
            writable: true
          }
        });
      }
      catch (noDefineProperty) {
        // Can't use ES5 Object.defineProperty, fallback
        this._dirty = 0;
        this._data = data || {};
      }
    },

    destroy: function() {
      this.off();
      async.clearImmediate(this._dirty);
      this._data = null;
    },

    id: function() {
      return this._id;
    },

    data: function() {
      var orig = this._data, clone;

      if (!this._dirty) {
        clone = Object.keys(orig).reduce(function(obj, key) {
          return obj[key] = copy(orig[key]), obj;
        }, {});
        this._dirty = async(dirtyCheck.bind(this, clone));
      }
      return this._data;
    },

    get: function(prop) {
      var value = this._data[prop];
      // If getting an array, we must watch for array mutators
      if (Array.isArray(value)) {
        return this.data()[prop];
      }
      return value;
    },

    set: function(values, value) {
      var key, data = this.data();

      if (typeof values === "string") {
        data[values] = copy(value);
        return this;
      }

      if (typeof values === "object") {
        for (key in values) {
          if (values.hasOwnProperty(key)) {
            data[key] = copy(values[key]);
          }
        }
        return this;
      }
    },

    toJSON: function() {
      return this._data;
    }
  }, {
    displayName: 'Model'
  })
  .mixin(pubsub);

  return constructor;
});
