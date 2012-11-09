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
    define(['jquery', 'nbd/Class', 'nbd/View'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery, root.Class, root.View);
  }
}( 'jQuery.Core.Controller', function( $, Class, View ) {
  "use strict";

  var constructor = Class.extend({
    // Stubs
    init : function() {},
    render : function() {},
    destroy : function() {}
  },{

    // Finds out if a subclass has the superclass in its inheritance chain
    inherits : function( subclass, superclass ) {

      var ancestor, isSpawn = false;

      if ( !superclass ) {
        superclass = subclass;
        subclass = this;
      }

      if ( typeof subclass !== 'function' || typeof superclass !== 'function' ) {
        return isSpawn;
      }

      ancestor = subclass.prototype;

      while ( ancestor.constructor.__super__ ) {
        ancestor = ancestor.constructor.__super__;
        if ( ancestor === superclass.prototype ) {
          isSpawn = true;
          break;
        }
      }

      return isSpawn;

    }, // inherits

    addTemplate : function( id, html ) {
      return $('<script id="' + id + '" type="text/x-jquery-tmpl">' + html + '</script>').appendTo( document.body );
    }, // addTemplate


    // Loads a template into the page, given either the template id and URL or a view
    // Controller.loadTemplate( Core.View, [callback(templateId)] );
    loadTemplate : function( view, callback ) {

      var wait = $.Deferred(),
          TEMPLATE_ID, TEMPLATE_URL;

      if ( view.inherits && view.inherits(View) ) {
        callback     = (typeof callback === "function" && callback !== view) ? callback : null;
        TEMPLATE_ID  = view.TEMPLATE_ID;
        TEMPLATE_URL = view.TEMPLATE_URL;
      }

      if ( $('#'+TEMPLATE_ID).length ) {
        return $.Deferred().resolve();
      }
      
      if ( !TEMPLATE_ID || !TEMPLATE_URL ) {
        $.error("No template found");
        return false;
      }

      $.ajax({
        url : TEMPLATE_URL,
        cache : true
      }).then( function( data ) {
        var sargs = arguments;
        if ( !data.html ) {
          return false;
        }

        $(function(){
          constructor.addTemplate( TEMPLATE_ID, data.html );
          if ( $.isFunction(callback) ) { callback( TEMPLATE_ID ); }
          wait.resolve.apply( wait, sargs );
        });
      }, wait.reject, wait.notify);

      return wait.promise();

    } // loadTemplate

  });

  return constructor;

}));
