define(['nbd/Class',
       'nbd/util/async',
       'nbd/util/extend',
       'nbd/util/diff',
       'nbd/trait/pubsub'
], function(Class, async, extend, diff, pubsub) {
  "use strict";

  var dirtyCheck = function(old, novel) {
    if (!this._dirty) { return; }
    diff.call(this, novel, old, this.trigger);
    this._dirty = false;
  },

  constructor = Class.extend({

    init: function(id, data) {

      if ( typeof id === 'string' && id.match(/^\d+$/) ) {
        id = +id;
      }

      if ( data === undefined ) {
        data = id;
      }

      this.id = function() {
        return id;
      };

      Object.defineProperty(this, '_dirty', { writable: true });
      Object.defineProperty(this, '_data', {
        enumerable: false,
        configurable: true,
        value: data || {},
        writable: true
      });

    },

    destroy: function() {
      this.off(null);
    },

    data : function() {
      this._dirty = true;
      async(dirtyCheck.bind(this, extend({}, this._data), this._data));
      return this._data;
    },

    get: function(prop) {
      return this._data[prop];
    },

    set: function(values, value) {
      var key, data = this.data();

      if ( typeof values === "string" ) {
        data[values] = value;
        return this;
      }

      if ( typeof values === "object" ) {
        for ( key in values ) {
          if ( values.hasOwnProperty( key ) ) {
            data[key] = values[key];
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
