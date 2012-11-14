define(['jquery', 'nbd/Class', 'nbd/util/async', 'nbd/trait/pubsub'], function($, Class, async, pubsub) {
  "use strict";

  function _set( data, prop, val, strict ) {
    if ( strict && !data.hasOwnProperty(prop) ) {
      throw new Error( 'Invalid property: '+ prop );
    }
    data[ prop ] = val;
  }

  var 
  dirtyCheck = function(old, novel) {
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

    init : function( id, data ) {

      data = data || {};

      if ( typeof id === 'string' && id.match(/^\d+$/) ) {
        id = +id;
      }

      Object.defineProperty(this, '_dirty', { writable: true });

      this.id = function() {
        return id;
      };

      this.data = function() {
        this._dirty = true;
        async(dirtyCheck.bind(this, $.extend({}, data), data));
        return data;
      };

    }, // init

    destroy : function() {
      this.off(null);
    },

    get : function( prop, strict ) {
    
      strict = ( typeof strict !== 'boolean' ) ? true : strict;
      
      var data = this.data();

      if ( strict && !data.hasOwnProperty(prop) ) {
        throw new Error( 'Invalid property: '+ prop );
      }

      return data[prop];

    }, // get

    set : function( values, value, strict ) {

      var data, key;

      if ( typeof values === "object" ) {
        strict = value;
      }

      strict = ( typeof strict === 'boolean' ) ? strict : true;
      data = this.data();

      if ( typeof values === "string" ) {
        _set( data, values, value, strict );
        return this;
      }

      if ( typeof values === "object" ) {
        for ( key in values ) {
          if ( values.hasOwnProperty( key ) ) {
            _set( data, key, values[ key ], strict );
          }
        }
        return this;
      }

    }, // set

    update : function( data, options ) {

      options = options || {type:'POST'};
      
      var Model = this,
          type  = this.constructor.UPDATE_AJAX_TYPE;
      
      return $.ajax({
        url   : this.constructor.URL_UPDATE,
        type  : type,
        data  : data
      }).done( function( json ) {
        
        if( Model.constructor.API === true || json.updated ) {
          
          if ( Model.constructor.API ) {
            data = $.extend( json[0], $.parseJSON( data )[0] );
            if ( Model.constructor.filterUpdateData ) {
              Model.constructor.filterUpdateData( data );
            }
          }
          
          Model.set( data );
        }
          
      });

    } // update

  }, {

    create : function( data ) {

      return $.ajax({
        url   : this.URL_CREATE,
        type  : 'POST',
        data  : data
      });

    }, // create

    UPDATE_AJAX_TYPE : 'POST'

  })
  .mixin(pubsub);

  return constructor;

});
