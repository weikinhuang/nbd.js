(function(root, factory) {
  var namespace, name;
  if (typeof root === 'string') {
    namespace = root.split('.');
    name = namespace.pop();
    root = namespace.reduce(function(o,ns){
      return o && o[ns];
    }, this);
  }
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'nbd/Class'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery, root.Class);
  }
}( 'jQuery.Core.Model', function( $, Class ) {
  "use strict";

  var constructor = Class.extend({

    type : null,

    init : function( id, data ) {

      data = data || {};

      if ( typeof id === 'string' && id.match(/^\d+$/) ) {
        id = +id;
      }

      this.id = function() {
        return id;
      };

      this.data = function() {
        return data;
      };

    }, // init

    get : function( prop, strict ) {
    
      strict = ( typeof strict !== 'boolean' ) ? true : strict;
      
      var data = this.data();

      if ( strict && !data.hasOwnProperty(prop) ) {
        $.error( 'Invalid property in '+this.type+' : '+ prop );
      }

      return data[prop];

    }, // get

    set : function( values, value, strict ) {

      if ( typeof values === "object" ) {
        strict = value;
      }

      strict = ( typeof strict === 'boolean' ) ? strict : true;

      var data = this.data(),
          type = this.type,
          key;

      function _set( prop, val ) {

        if ( strict && !data.hasOwnProperty(prop) ) {
          $.error( "Invalid property in "+type+' : '+ prop );
        }

        data[ prop ] = val;

      }

      switch( typeof values ) {
        case "string":
          _set( values, value );
          break;
        case "object":
          for ( key in values ) {
            if ( values.hasOwnProperty( key ) ) {
              _set( key, values[ key ] );
            }
          }
          break;
      }

    }, // set

    update : function( data, options ) {

      options = options || {};
      
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

  });

  return constructor;

}));
