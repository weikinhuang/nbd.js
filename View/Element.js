define(['jquery', 'nbd/View'], function($, View) {
  "use strict";

  var constructor = View.extend({

    $parent: null,

    init : function( $parent ) {
      this.$parent = $parent;
    },

    render : function( data ) {
      var exists = this.$view && this.$view.length;

      this._super(data);

      if (!exists) {
        this.$view.appendTo(this.$parent);
      }

      return this.$view;
    }

  });

  return constructor;

});
