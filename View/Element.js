define(['jquery', 'nbd/View'], function($, View) {
  "use strict";

  var constructor = View.extend({

    $parent: null,

    init : function( $parent ) {
      this.$parent = $parent;
    },

    render : function( data ) {
      var exists = this.$view && this.$view.length;

      if (!exists) {
        this.$view = $('<div/>').appendTo(this.$parent);
      }

      this._super(data);

      return this.$view;
    }

  });

  return constructor;

});
