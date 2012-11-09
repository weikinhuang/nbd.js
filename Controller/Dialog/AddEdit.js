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
    define(['nbd/Controller/Dialog'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, root);
  }
}( 'jQuery.Core.Controller.Dialog.AddEdit', function( Dialog ) {
  "use strict";

  var constructor = Dialog.extend({

    render : function( Entity ) {


      var _this    = this,
          subclass = "Add";

      if ( this.blocking ) {
        return;
      }

      if ( this.View ) {
        this.View.destroy();
        this.View = null;
      }

      if ( Entity instanceof this.constructor.ENTITY_CLASS ) {
        subclass = "Edit";
      }

      if ( this.constructor.VIEW_CLASS[ subclass ].templateScript( false ) === false ) {
        this.constructor.loadTemplate( this.constructor.VIEW_CLASS[ subclass ] )
          .done( function() {
            _this.blocking = false;
            _this.render( Entity );
          });
        this.blocking = true;
        return;
      }

      this.View = new this.constructor.VIEW_CLASS[ subclass ]( Entity );
      this.View.Controller = this;
      this.View.render();

    } // render

  }); // AMO.Controller.Dialog.AddEditDialog

  return constructor;

}));
