define(['nbd/Class',
       'nbd/View',
       'nbd/util/construct'
],  function(Class, View, construct) {
  "use strict";

  var constructor = Class.extend({
    View  : null,
    destroy : function() {},

    _initView : function( ViewClass ) {
      var args = Array.prototype.slice.call(arguments, 1);
      (this.View = construct.apply(ViewClass, args))
      .Controller = this;
    },

    switchView : function() {
      var Existing = this.View;
      this._initView.apply(this, arguments);

      if ( !Existing ) { return; }

      if (Existing.$view) {
        this.View.$view = Existing.$view;
        this.View.render();
      }

      Existing.destroy();
    }

  });

  return constructor;

});
