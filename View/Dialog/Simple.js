define(['jquery', 'nbd/View/Dialog'], function($, View) {
  "use strict";

  var exports = View.extend({

    render : function(description, callback) {

      var blocking;

      if ( typeof description === "string" ) {
        this.options.description = description;
      }
      else if ( typeof description === "object" ) {
        $.extend( this.options, description );
      }

      this.callback = callback;

      this._super();

      // Click 'outside' to close
      
      blocking = this.$view.data('blockingDiv.popup').on('click', function(e) {
        if (e.target === blocking[0]) { this.destroy(); }
      }.bind(this) );

    }, // render

    rendered : function( $form ) {

      $form.on('click', '.form-button.form-submit', function() {
        if (this.options.closeOnSubmit !== false) {
          this.destroy();
        }
        if ( $.isFunction(this.callback) ) {
          this.callback();
        }
      }.bind(this) );

    } // rendered

  }, {
    TEMPLATE_ID : 'popup-template'
  });

  return exports;
});
