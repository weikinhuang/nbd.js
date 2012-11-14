define(['jquery', 'nbd/Class', 'nbd/View'],  function($, Class, View) {
  "use strict";

  var constructor = Class.extend({
    // Stubs
    init : function() {},
    destroy : function() {}
  },{

    addTemplate : function( id, html ) {
      return $('<script id="' + id + '" type="text/x-jquery-tmpl">' + html + '</script>').appendTo( document.body );
    }, // addTemplate


    // Loads a template into the page, given either the template id and URL or a view
    // Controller.loadTemplate( View, [callback(templateId)] );
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

});
