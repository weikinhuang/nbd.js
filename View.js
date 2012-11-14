define(['jquery', 'nbd/Class'], function($, Class) {
  "use strict";

  var constructor = Class.extend({

    $view    : null,

    render : function() {},
    template : function() {},
    
    destroy : function() {
      if ( this.$view instanceof $ ) {
        this.$view.remove();
      }
      this.$view = null;
    }

  });

  return constructor;

});
