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

      data = data || {};

      Object.defineProperty(this, '_dirty', { writable: true });

      this.id = function() {
        return id;
      };

      this.data = function() {
        this._dirty = true;
        async(dirtyCheck.bind(this, extend({}, data), data));
        return data;
      };

    },

    destroy: function() {
      this.off(null);
    },

    get: function(prop) {
      var data = this.data();
      this._dirty = false;
      return data[prop];
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

    toString: function() {
      return this.data();
    }
  })
  .mixin(pubsub);

  return constructor;

});
