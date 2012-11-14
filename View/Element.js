define(['jquery', 'nbd/View'], function($, View) {
  "use strict";

  var constructor = View.extend({

    init : function( $parent ) {
      this.$parent = $parent;
    },

    render : function( data ) {
      var $existing = this.$view;

      this.$view = this.template( data );

      if ( $existing && $existing.length ) {
        $existing.replaceWith( this.$view );
      }
      else {
        this.$view.appendTo( this.$parent );
      }

      if ( $.isFunction(this.rendered) ) {
        this.rendered();
      }

      return this.$view;
    }

  }); // View extend

  return constructor;

});
