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
}( 'jQuery.Core.View', function( $, Class ) {
  "use strict";

  var constructor = Class.extend({

    $parent  : null,
    $view    : null,

    // Stub
    init : function() {},

    templateScript : function() {
      return this.constructor.templateScript();
    },
    
    destroy : function() {

      if ( this.$view instanceof $ ) {
        this.$view.remove();
      }
      this.$view = null;

    } // destroy

  }, {

    templateScript : function( strict ) {

      strict = ( typeof strict !== 'undefined' ) ? strict : true;

      if ( !this.$TEMPLATE || !this.$TEMPLATE.length ) {
        this.$TEMPLATE = $( '#' + this.TEMPLATE_ID );
      }
      
      if ( !this.$TEMPLATE.length ) {

        if ( strict === true ) {
          $.error( 'Missing template: ' + this.TEMPLATE_ID );
        }
        else {
          return false;
        }

      } // if !$TEMPLATE or !$TEMPLATE length

      return this.$TEMPLATE;

    } // templateScript

  });

  return constructor;

}));
