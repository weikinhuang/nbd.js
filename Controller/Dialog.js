// (╯°□°）╯︵ ┻━┻
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
    define(['jquery', 'nbd/Events', 'nbd/Controller'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery, jQuery.Core.Events, root);
  }
}( 'jQuery.Core.Controller.Dialog', function( $, Events, Controller ) {
  "use strict";

  var constructor = Controller.extend({

    blocking : false, // when true, it won't try to load template again
    
    View : null,

    init : function() {

      var render = this.render = $.proxy( this.render, this );

      function bind( name ) {
        Events.bind( name, render );
      }

      // If class expects a Core event to trigger rendering
      if ( this.constructor.RENDER_EVENT ) {
      
        if ( typeof this.constructor.RENDER_EVENT === "string" ) {
          bind( this.constructor.RENDER_EVENT );
        }
        else if ( $.isArray( this.constructor.RENDER_EVENT ) ) {
          $.map( this.constructor.RENDER_EVENT, bind );
        }
        
      } // if RENDER_EVENT

    }, // init

    render : function( Entity ) {
    
      var _this = this,
          args  = arguments;
      
      if ( this.blocking ) {
        return;
      }
      
      // If template is not on page
      if ( this.constructor.VIEW_CLASS.templateScript( false ) === false ) {
      
        this.constructor.loadTemplate( this.constructor.VIEW_CLASS )
          .done(function(data) {
            if ( data.html ) {
              _this.blocking = false;
              _this.render.apply( _this, args );
            }
          });
        
        this.blocking = true;
        return;
      }

      if ( Entity && this.constructor.ENTITY_CLASS && !( Entity instanceof this.constructor.ENTITY_CLASS ) ) {
        return;
      }

      if ( this.View ) {
        this.View.destroy();
        this.View = null;
      }

      this.View = new this.constructor.VIEW_CLASS();
      this.View.Controller = this;
      this.View.render.apply(this.View, arguments);

    }, // render

    destroy : function() {

      var render = this.render;

      function unbind( name ) {
        Events.unbind( name, render );
      }

      // If class expects a Core event to trigger rendering
      if ( this.constructor.RENDER_EVENT ) {
      
        if ( typeof this.constructor.RENDER_EVENT === "string" ) {
          unbind( this.constructor.RENDER_EVENT );
        }
        else if ( $.isArray( this.constructor.RENDER_EVENT ) ) {
          $.map( this.constructor.RENDER_EVENT, unbind );
        }
        
      } // if RENDER_EVENT
    
      if ( !this.View ) {
        return;
      }
    
      this.View.destroy();
      this.View = null;

    } // destroy
  },{
    RENDER_EVENT : null,
    ENTITY_CLASS : null,
    VIEW_CLASS   : null
  }); // Controller.Dialog

  return constructor;

}));
