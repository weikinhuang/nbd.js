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
    define(['jquery', 'Core', 'nbd/View', 'nbd/Events'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery, jQuery.Core, root, jQuery.Core.Events);
  }
}( 'jQuery.Core.View.Dialog', function( $, util, View, Events ) {
  "use strict";

  var constructor = View.extend({

    $popup  : null,
    options : { close_btn : true },

    init : function() {

      this.destroy = $.proxy( function(e, success) {
        if ( success === false ) { return; }
        this._destroy.apply(this, arguments);
      }, this );

    }, // init

    _destroy : function() {
    
      if ( !this.$view ) {
        return;
      }
    
      Events.trigger('keyboard.off');
      this.$view.popup('destroy');
      this.$view = null;
      this.$popup = null;
    
    }, // destroy

    render : function() {

      var _this = this,
          $form;

      this.$view = this.$popup = util.popup( this.options );
      $form      = this.$view.find( 'form' ).first();

      // Unbind Core.popup binding to avoid double-destroy
      this.$view.find('#popup-force-close').off( 'click' )
        .add( this.$view.find( '#popup-cancel' ) ).on( 'click', this.destroy );

      Events.trigger('keyboard.on', { 'escape' : $.proxy(this._destroy, this) });

      if ( this.rendered ) {
        this.rendered( $form );
      }
      
      // Ensure that the popup is in right position after any synchronous rendering logic
      this.$view.popup( 'position' );

    } // render
    
  }); // constructor

  return constructor;

}));
