if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['nbd/View'], function(View) {
  "use strict";

  var constructor = View.extend({

    init : function( model ) {
      if (typeof model === 'object') {
        this.Model = model;
      }

      this.id = (model && model.id) || function() {
        return model;
      };
    },
    
    // all data needed to template the view
    templateData : function() {
      return (this.Model && this.Model.data) ? this.Model.data() : this.id();
    },
    
    render : function( $parent ) {

      // $existing could be a string
      var $existing = this.$view,
          fresh = !!$existing ^ !!$parent;

      this.trigger('prerender');

      // When there's either no rendered view XOR there isn't a parent
      if ( fresh ) {
        if (typeof $existing !== "string" ) {
          this.$view = this.template( this.templateData() );
        }
      }
      else if ( !$existing ) {
        return;
      }

      if (typeof $existing === "string") {
        this.$view = require('jquery')(this.$view);
        fresh = !!$parent;
        if ( !fresh ) { return; }
      }

      if ( $parent ) {
        $parent.append( this.$view );
      }
      else {
        $existing.replaceWith( this.$view );
      }

      if ( fresh ) {
        this.trigger('postrender', this.$view);

        if ( typeof this.rendered === 'function' ) {
          this.rendered(this.$view);
        }
      }

      return this.$view;

    } // render
    
  }); // View Entity

  return constructor;

});
