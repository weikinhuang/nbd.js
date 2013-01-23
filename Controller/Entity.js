define(['jquery', 'nbd/Controller'], function( $, Controller ) {
  'use strict';

  var constructor = Controller.extend({

    View  : null,
    Model : null,

    init : function( id, data ) {
    
      this.Model = new this.constructor.MODEL_CLASS( id, data );
      this._initView( this.Model );

    }, // init

    // renders this entity
    render : function( $parent, ViewClass ) {

      ViewClass = ViewClass || this.constructor.VIEW_CLASS;

      this.requestView( ViewClass );
      this.View.render( $parent );

    }, // render

    destroy : function() {
      this.View.destroy();
      this.Model = this.View = null;
    }, // destroy

    _initView : function( Model ) {
      this.View = new this.constructor.VIEW_CLASS( Model );
      this.View.Controller = this;
    }, // makeView

    requestView : function( Class ) {

      if ( this.View instanceof Class || !this.Model ) {
        return;
      }

      this.switchView( Class );

    }, // requestView

    switchView : function( Class ) {

      var Existing = this.View;
      this.View = new Class( this.Model );
      this.View.Controller = this;

      if ( Existing && Existing.$view !== null ) {
        this.View.$view = Existing.$view;
        this.View.render();
      }

      return Existing && Existing.destroy();
    
    } // switchView

  },{
    // Corresponding Entity View class
    VIEW_CLASS : null,

    // Corresponding Entity Model class
    MODEL_CLASS : null
  }); // Entity Controller

  return constructor;

});
