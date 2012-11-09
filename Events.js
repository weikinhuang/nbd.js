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
    define(['jquery'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery);
  }
}( 'jQuery.Core.Events', function( $ ) {
  "use strict";

  // Store each registered $.Callbacks object by namespace
  var cache = {};

  // Bind callback to event
  function bind( ev, callback, options ) {
  
    if ( typeof ev !== 'string' ) {
      $.error('Invalid event name');
    }

    if ( !$.isFunction(callback) ) {
      $.error('Invalid callback');
    }

    if ( options && cache[ev] ) {
      $.error('Provided options after initial bind');
    }
    
    // If this callback list does not exist, create it
    if ( !cache[ ev ] ) {
      // Make $.Callbacks default to having stopOnFalse
      options = options || 'stopOnFalse';
      cache[ ev ] = {
        cb    : $.Callbacks( options ),
        funcs : []
      };
    }
    
    // Add callback to $.Callbacks
    cache[ ev ].cb.add( callback );
    cache[ ev ].funcs.push( callback );
   
  } // bind

  function option( ev, options ) {

    var inc, len, func;
  
    // Create the event if it didn't exist
    if ( !cache[ ev ] ) {
      cache[ ev ] = {
        cb    : $.Callbacks( options ),
        funcs : []
      };
      return;
    }
    
    // Remove all callbacks from $.Callbacks
    cache[ev].cb.empty();
    
    // Create a new $.Callbacks list with the new options
    // Note: there's no way to restore fired/memory state from the original Callback
    cache[ ev ].cb = $.Callbacks( options );
    
    // Loop through array of callback functions to insert into fresh $.Callbacks
    for ( inc = 0, len = cache[ ev ].funcs.length; inc < len; ++inc ) {
      func = cache[ ev ].funcs[ inc ];
      cache[ ev ].cb.add( func );
    } // for inc

  }
  
  function updateOptions( ev, options ) {
  
    if ( !cache[ ev ] ) {
      $.error('Event does not exist');
    }

    return option( ev, options );
  
  } // updateOptions

  function unbind( ev, callback ) {
  
    // Ignore unbind if it didn't exist
    if ( !cache[ ev ] ) {
      return;
    }
    
    if ( !callback ) {
      cache[ ev ].cb.empty();
      delete cache[ ev ];
      return;
    }
    
    // Remove from list
    cache[ ev ].cb.remove( callback );
    
    // Remove from cache of funcs for option change
    cache[ ev ].funcs = $.grep( cache[ ev ].funcs, function(value) {
      return value !== callback;
    });
    
  } // unbind

  function trigger( ev ) {
  
    // Ignore trigger if it doesn't exist
    if ( !cache[ ev ] ) {
      return;
    }
  
    // Get dynamic number of arguments, knowing first argument is always event
    var pass = Array.prototype.slice.call( arguments, 1 );
        
    // Call $.Callbacks fire method with right arguments
    cache[ ev ].cb.fireWith( null, pass );
    
  } // trigger
    
  return {
    bind : bind,
    unbind : unbind,
    trigger : trigger,
    option : option,
    updateOptions : updateOptions
  };

})); // Events
