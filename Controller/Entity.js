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
    define(['jquery', 'nbd/Controller'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery, root);
  }
}( 'jQuery.Core.Controller.Entity', function( $, Controller ) {

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

    // refreshing the view according to its model
    update : function() {

      this.View.update();

    }, // update

    // post draw hook
    fix : function() {
      
      this.View.fix();

    }, // fix

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

    // swaps this entity's view class with another
    switchView : function( Class ) {

      var Existing = this.View;
      if ( !this.constructor.inherits( Class, AMO.View.Entity ) ) {
        $.error( "Entity Controller: Non-Entity View" );
      }

      this.View = new Class( this.Model );
      this.View.Controller = this;

      if ( Existing && Existing.$view !== null ) {
        this.View.$view = Existing.$view;
        this.View.render();
      }

      Existing.destroy();
    
    } // switchView

  },{
    // Corresponding Entity View class
    VIEW_CLASS : null,

    // Corresponding Entity Model class
    MODEL_CLASS : null
  }); // Entity Controller

  return constructor;

}));
