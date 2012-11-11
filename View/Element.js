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
    define(['jquery', 'nbd/View'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery, root);
  }
}( 'jQuery.Core.View.Element', function( $, View ) {
  "use strict";

  var constructor = View.extend({

    init : function( $parent ) {
      this.$parent = $parent;
    }, // init
    
    render : function( data ) {
    
      var $existing = this.$view;

      this.$view = this.templateScript().tmpl( data );

      if ( $existing && $existing.length ) {
        $existing.replaceWith( this.$view );
      }
      else {
      
        if ( !this.$parent || !this.$parent.length ) {
      
          if ( !this.PARENT_ID && !this.constructor.PARENT_ID ) {
            $.error( "Must define a parent or parent selector" );
            return;
          }
          
          this.$parent = $( '#' + ( this.PARENT_ID || this.constructor.PARENT_ID ) );
        
        } // if !parent
        
        this.$parent.append( this.$view );
        
      } // else existing

      if ( $.isFunction(this.rendered) ) {
        this.rendered();
      }

    } // render

    
  }); // View extend

  return constructor;

}));
