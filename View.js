if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['nbd/Class'], function(Class) {
  "use strict";

  var constructor = Class.extend({

    $view: null,

    render: function(data) {
      var $existing = this.$view;

      this.$view = this.template(data || this.templateData());

      if ( $existing && $existing.length ) {
        $existing.replaceWith( this.$view );
      }

      if(this.rendered) {
        this.rendered(this.$view);
      }

      return this.$view;
    },

    template: function() {},
    templateData: function() { return {}; },
    
    destroy: function() {
      if ( this.$view && this.$view.remove ) {
        this.$view.remove();
      }
      this.$view = null;
    }

  });

  return constructor;

});
