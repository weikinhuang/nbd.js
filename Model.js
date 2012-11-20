define(['nbd/Class', 'nbd/util/async', 'nbd/util/extend', 'nbd/trait/pubsub'], function(Class, async, extend, pubsub) {
  "use strict";

  var dirtyCheck = function(old, novel) {
    if (!this._dirty) { return; }
    var key, i, diff = [];

    for (key in novel) {
      if (novel.hasOwnProperty(key)) {
        if (old[key] !== novel[key]) {
          diff.push([key, novel[key], old[key]]);
        }
        delete old[key];
      }
    }

    // Any remaining keys are only in the old
    for (key in old) {
      if (old.hasOwnProperty(key)) {
        diff.push([key, undefined, old[key]]);
      }
    }
    
    for (i=0; i<diff.length; ++i) {
      this.trigger.apply(this, diff[i]);
    }

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
    }
  })
  .mixin(pubsub);

  return constructor;

});
