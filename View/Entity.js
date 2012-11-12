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
    define(['jquery', 'nbd/View', 'nbd/Model'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery, root, jQuery.Core.Model);
  }
}( 'jQuery.Core.View.Entity', function( $, View, Model ) {
  "use strict";

  var constructor = View.extend({

    init : function( model ) {
    
      if ( model instanceof Model ) {
        this.Model = model;
        // this.Model.id should be a function
        this.id = this.Model.id;
      }
      else {
        this.id = function() { return model; };
      }
    
    }, // init
    
    // aggregates all data needed to template the view into one object
    templateData : function() {
      return { Model: this.Model };
    }, // templateData
    
    render : function( $parent ) {

      // $existing could be a string from pre-templating
      var $existing = this.$view,
          fresh = !!$existing ^ !!$parent;

      // When there's either no rendered view or there isn't a parent
      if ( fresh ) {
        if (typeof $existing !== "string" ) {
          this.$view = this.templateScript().tmpl( this.templateData() );
        }
      }
      else if ( !$existing ) {
        return;
      }

      if (typeof $existing === "string") {
        this.$view = $(this.$view);
        fresh = !!$parent;
        if ( !fresh ) { return; }
      }

      if ( $parent ) {
        $parent.append( this.$view );
      }
      else {
        $existing.replaceWith( this.$view );
      }

      if ( fresh && typeof this.rendered === 'function' ) {
        this.rendered();
      }

    } // render
    
  }); // View Entity

  return constructor;

}));
