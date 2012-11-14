(function(global) {
/**
 * almond 0.2.0 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name) && !defining.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (defined.hasOwnProperty(depName) ||
                           waiting.hasOwnProperty(depName) ||
                           defining.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("vendor/almond/almond", function(){});

/**
 * Behanced Class
 * Built from Simple JS Inheritance by John Resig
 * Addons:
 * - Static properties inheritance
 * - init() auto-calls super's init()
 * - can prevent auto-calling with stat._
 * - __super__ for Backbone.js compatibility
 * - Uses AMD pattern, with global fallback
 * - mixin() for implementing abstracts
 */

/*jslint sloppy:true */
/*global define, jQuery */
define('nbd/Class',[],function() {
  

  var Klass, inherits, mixin,
  initializing = false, 
  fnTest = /xyz;/.test(function(){var xyz;return xyz;}) ? /\b_super\b/ : /.*/;

  // Addon: mixin allows adding any object's properties into the class
  mixin = function(abstract) {
    var prop, descriptor = {};
    for (prop in abstract) {
      if (abstract.hasOwnProperty(prop)) {
        descriptor[prop] = {
          value:abstract[prop]
        };
      }
    }
    Object.defineProperties(this.prototype, descriptor);
    return this;
  };

  // Addon: inherits determines if current class inherits from superclass
  inherits = function(superclass) {
    var ancestor;

    if ( typeof this === 'function' && typeof superclass === 'function' ) {
      ancestor = this.prototype;
      while ( ancestor.constructor.__super__ ) {
        ancestor = ancestor.constructor.__super__;
        if ( ancestor === superclass.prototype ) {
          return true;
        }
      }
    }

    return false;
  };

  // The base Class implementation (does nothing)
  Klass = function(){};
  Klass.inherits = inherits;

  // Create a new Class that inherits from this class
  Klass.extend = function extend(prop, stat) {
    var prototype, name, initfn, _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    prototype = new this();
    initializing = false;

    function protochain(name, fn, initfn) {
      return function() {
        var hadSuper = this.hasOwnProperty('_super'), tmp = this._super;
       
        // Add a new ._super() method that is the same method
        // but on the super-class
        this._super = _super[name];
       
        // Addon: calling up the init chain
        if (initfn) { this._super.apply(this, arguments); }

        // The method only need to be bound temporarily, so we
        // remove it when we're done executing
        try {
          return fn.apply(this, arguments);
        }
        catch(e) {
          // Empty catch for IE 8
        }
        finally {
          if (hadSuper) {this._super = tmp;}
        }
      };
    }

    function chainFn(parent, child) {
      return function() {
        parent.apply(this, arguments);
        return child.apply(this, arguments);
      };
    }

    // Copy the properties over onto the new prototype
    for (name in prop) {
      if ( prop.hasOwnProperty(name) ) {
        // Addon: check for need to call up the chain
        initfn = name === "init" && !(stat && stat.hasOwnProperty("_") && stat._);

        // Check if we're overwriting an existing function
        prototype[name] = 
          typeof prop[name] === "function" &&
          typeof _super[name] === "function" && 
          (initfn || fnTest.test(prop[name])) ?
          protochain(name, prop[name], initfn) :
          prop[name];
      }
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && typeof this.init === "function" ) {
        this.init.apply(this, arguments);
      }
    }

    // Addon: copy the superclass's stat properties
    for (name in this) {
      if (this.hasOwnProperty(name)) {
        Class[name] = this[name];
      }
    }

    // Addon: override the provided stat properties
    for (name in stat) {
      if (stat.hasOwnProperty(name)) {
        initfn = name === "init" && 
            !(stat && stat.hasOwnProperty("_") && stat._);
        Class[name] = initfn &&
          typeof Class[name] === "function" &&
          typeof stat[name] === "function" ?
          chainFn(Class[name], stat[name]) :
          stat[name];
      }
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = extend;

    // Addon: mixins for classes
    Class.mixin = mixin;

    // Addon: for backbone compat
    Class.__super__ = _super;
   
    return Class;
  };

  return Klass;
});

/*jslint sloppy:true */
define('jquery',[],function() {
  return global.jQuery;
});

/**
 * Utility function to break out of the current JavaScript callstack
 * Uses window.postMessage if available, falls back to window.setTimeout
 * @see https://developer.mozilla.org/en-US/docs/DOM/window.setTimeout#Minimum_delay_and_timeout_nesting
 * @module util/async
 */
define('nbd/util/async',[],function() {
  

  var timeouts = [], 
  messageName = "async-message",
  hasPostMessage = (
    typeof window.postMessage === "function" &&
    typeof window.addEventListener === "function"
  ),
  async;

  /**
   * Like setTimeout, but only takes a function argument.  There's
   * no time argument (always zero) and no arguments (you have to
   * use a closure).
   */
  function setZeroTimeout(fn) {
    timeouts.push(fn);
    window.postMessage(messageName, "*");
  }

  function handleMessage(event) {
    if (event.source === window && event.data === messageName) {
      event.stopPropagation();
      if (timeouts.length > 0) {
        var fn = timeouts.shift();
        fn();
      }
    }
  }

  if ( hasPostMessage ) {
    window.addEventListener("message", handleMessage, true);
  }

  /** @alias module:util/async */
  async = (hasPostMessage ? setZeroTimeout : function(fn) {window.setTimeout(fn,0);});

  return async;
});

// Backbone.Events
// ---------------
define('nbd/trait/pubsub',[],function() {
  

  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; `trigger`-ing an event fires all callbacks in succession.
  //
  // var object = {};
  // _.extend(object, Backbone.Events);
  // object.on('expand', function(){ alert('expanded'); });
  // object.trigger('expand');
  //
  return {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {
      var calls, event, list;
      if (!callback) { return this; }

      events = events.split(eventSplitter);

      if (!this._callbacks) {
        Object.defineProperty(this, '_callbacks', {
          configurable: true,
          value: {},
          writable: true
        });
      }
      calls = this._callbacks;

      while (event = events.shift()) {
        list = calls[event] || (calls[event] = []);
        list.push(callback, context);
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, list, i;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) { return this; }
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      events = events ? events.split(eventSplitter) : Object.keys(calls);

      // Loop through the callback list, splicing where appropriate.
      while (event = events.shift()) {
        if (!(list = calls[event]) || !(callback || context)) {
          delete calls[event];
          continue;
        }

        for (i = list.length - 2; i >= 0; i -= 2) {
          if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
            list.splice(i, 2);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, calls, list, i, length, args, all, rest;
      if (!(calls = this._callbacks)) { return this; }

      rest = [];
      events = events.split(eventSplitter);

      // Fill up `rest` with the callback arguments. Since we're only copying
      // the tail of `arguments`, a loop is much faster than Array#slice.
      for (i = 1, length = arguments.length; i < length; i++) {
        rest[i - 1] = arguments[i];
      }

      // For each event, walk through the list of callbacks twice, first to
      // trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        // Copy callback lists to prevent modification.
        if (all = calls.all) all = all.slice();
        if (list = calls[event]) list = list.slice();

        // Execute event callbacks.
        if (list) {
          for (i = 0, length = list.length; i < length; i += 2) {
            list[i].apply(list[i + 1] || this, rest);
          }
        }

        // Execute "all" callbacks.
        if (all) {
          args = [event].concat(rest);
          for (i = 0, length = all.length; i < length; i += 2) {
            all[i].apply(all[i + 1] || this, args);
          }
        }
      }

      return this;
    }

  };
});

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
    define('nbd/Model',['jquery', 'nbd/Class', 'nbd/util/async', 'nbd/trait/pubsub'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery, root.Class);
  }
}( 'jQuery.Core.Model', function($, Class, async, pubsub) {
  

  function _set( data, prop, val, strict ) {
    if ( strict && !data.hasOwnProperty(prop) ) {
      throw new Error( 'Invalid property: '+ prop );
    }
    data[ prop ] = val;
  }

  var 
  dirtyCheck = function(old, novel) {
    if (!this._dirty) { return; }
    var key, i, diff = [];

    for (key in novel) {
      if (novel.hasOwnProperty(key)) {
        if (old[key] !== novel[key]) {
          diff.push([key, novel[key], old[key]]);
        }
        delete old[key];
      }
    }

    // Any remaining keys are only in the old
    for (key in old) {
      if (old.hasOwnProperty(key)) {
        diff.push([key, undefined, old[key]]);
      }
    }
    
    for (i=0; i<diff.length; ++i) {
      this.trigger.apply(this, diff[i]);
    }

    this._dirty = false;
  },

  constructor = Class.extend({

    init : function( id, data ) {

      data = data || {};

      if ( typeof id === 'string' && id.match(/^\d+$/) ) {
        id = +id;
      }

      Object.defineProperty(this, '_dirty', { writable: true });

      this.id = function() {
        return id;
      };

      this.data = function() {
        this._dirty = true;
        async(dirtyCheck.bind(this, $.extend({}, data), data));
        return data;
      };

    }, // init

    get : function( prop, strict ) {
    
      strict = ( typeof strict !== 'boolean' ) ? true : strict;
      
      var data = this.data();

      if ( strict && !data.hasOwnProperty(prop) ) {
        $.error( 'Invalid property: '+ prop );
      }

      return data[prop];

    }, // get

    set : function( values, value, strict ) {

      var data, key;

      if ( typeof values === "object" ) {
        strict = value;
      }

      strict = ( typeof strict === 'boolean' ) ? strict : true;
      data = this.data();

      if ( typeof values === "string" ) {
        _set( data, values, value, strict );
        return this;
      }

      if ( typeof values === "object" ) {
        for ( key in values ) {
          if ( values.hasOwnProperty( key ) ) {
            _set( data, key, values[ key ], strict );
          }
        }
        return this;
      }

    }, // set

    update : function( data, options ) {

      options = options || {};
      
      var Model = this,
          type  = this.constructor.UPDATE_AJAX_TYPE;
      
      return $.ajax({

        url   : this.constructor.URL_UPDATE,
        type  : type,
        data  : data
      }).done( function( json ) {
        
        if( Model.constructor.API === true || json.updated ) {
          
          if ( Model.constructor.API ) {
            data = $.extend( json[0], $.parseJSON( data )[0] );
            if ( Model.constructor.filterUpdateData ) {
              Model.constructor.filterUpdateData( data );
            }
          }
          
          Model.set( data );
        }
          
      });

    } // update

  }, {

    create : function( data ) {

      return $.ajax({
        url   : this.URL_CREATE,
        type  : 'POST',
        data  : data
      });

    }, // create

    UPDATE_AJAX_TYPE : 'POST'

  })
  .mixin(pubsub);

  return constructor;

}));

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
    define('nbd/View',['jquery', 'nbd/Class'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery, root.Class);
  }
}( 'jQuery.Core.View', function( $, Class ) {
  

  var constructor = Class.extend({

    $parent  : null,
    $view    : null,

    // Stub
    init : function() {},

    templateScript : function() {
      return this.constructor.templateScript();
    },
    
    destroy : function() {

      if ( this.$view instanceof $ ) {
        this.$view.remove();
      }
      this.$view = null;

    } // destroy

  }, {

    templateScript : function( strict ) {

      strict = ( typeof strict !== 'undefined' ) ? strict : true;

      if ( !this.$TEMPLATE || !this.$TEMPLATE.length ) {
        this.$TEMPLATE = $( '#' + this.TEMPLATE_ID );
      }
      
      if ( !this.$TEMPLATE.length ) {

        if ( strict === true ) {
          $.error( 'Missing template: ' + this.TEMPLATE_ID );
        }
        else {
          return false;
        }

      } // if !$TEMPLATE or !$TEMPLATE length

      return this.$TEMPLATE;

    } // templateScript

  });

  return constructor;

}));

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
    define('nbd/Controller',['jquery', 'nbd/Class', 'nbd/View'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery, root.Class, root.View);
  }
}( 'jQuery.Core.Controller', function( $, Class, View ) {
  

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
    define('nbd/Events',['jquery'], function() {
      var module = factory.apply(this, arguments);
      if (root) { root[name] = module; }
      return module;
    });
  }
  else {
    (root||this)[name] = factory.call(this, jQuery);
  }
}( 'jQuery.Core.Events', function( $ ) {
  

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
;
define('nbd/util/pipe',[],function() {
  
  return function chain() {
    var chainArgs = arguments;
    return function() {
      var i, retval;
      for (i=0; i<chainArgs.length; ++i) {
        retval=chainArgs[i].apply(this, i===0?arguments:[retval]);
      }
      return retval;
    };
  };
});

/** 
 * Prototype chain append utility
 * Inspired by Mozilla's Object.appendChain()
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/GetPrototypeOf#Notes 
 */
define('nbd/util/protochain',[],function() {
  

  function swapProto(lProto, oProto) {
    var inst, p;

    if ((p=Object.getPrototypeOf(lProto)) !== Object.prototype) {
      swapProto(p, oProto); //?
      oProto = p.constructor.prototype;
    }

    inst = Object.create(oProto);
    for (p in lProto) {
      if (lProto.hasOwnProperty(p)) {
        inst[p] = lProto[p];
      }
    }
    inst.constructor = lProto.constructor;
    lProto.constructor.prototype = inst;

  }

  return function(Klass, Class, forced) {
    if (arguments.length < 2) {
      throw new TypeError("Not enough arguments");
    }
    if (typeof Klass !== "function") {
      throw new TypeError("First argument must be a constructor");
    }
    if (typeof Class !== "function") {
      throw new TypeError("Second argument must be a constructor");
    }
    
    var it = Klass.prototype, up;

    // Find the top non-native prototype
    while ((up=Object.getPrototypeOf(it)) !== Object.prototype) { it = up; }

    try {
      // Try to modify the chain seamlessly if possible
      if (it.__proto__) {
        it.__proto__ = Class.prototype;
        return;
      }
    }
    catch(noProto) {
      // rethrow the error by default
      if (forced !== true) { 
        throw noProto;
      }
    }

    if (forced !== true) { 
      throw new Error("Cannot modify prototype chain"); 
    }

    swapProto(Klass.prototype, Class.prototype);
  }
});

define('nbd/util/jxon',[],function() {
  

  /**
   * Utility for transforming JSON to XML and back
   * @exports util/jxon
   * @see https://developer.mozilla.org/en-US/docs/JXON
   */

  var exports,
  sValueProp = "keyValue", sAttributesProp = "keyAttributes", sAttrPref = "@", /* you can customize these values */
  aCache = [], rIsNull = /^\s*$/, rIsBool = /^(?:true|false)$/i;

  function parseText (sValue) {
    if (rIsNull.test(sValue)) { return null; }
    if (rIsBool.test(sValue)) { return sValue.toLowerCase() === "true"; }
    if (isFinite(sValue)) { return parseFloat(sValue); }
    if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
    return sValue;
  }

  function EmptyTree () { }
  EmptyTree.prototype.toString = function () { return "null"; };
  EmptyTree.prototype.valueOf = function () { return null; };

  function objectify (vValue) {
    return vValue === null ? new EmptyTree() : vValue instanceof Object ? vValue : new vValue.constructor(vValue);
  }

  function createObjTree (oParentNode, nVerb, bFreeze, bNesteAttr) {
    var
    nLevelStart = aCache.length, bChildren = oParentNode.hasChildNodes(),
    bAttributes = oParentNode.hasAttributes(), bHighVerb = Boolean(nVerb & 2),

    sProp, vContent, nLength = 0, sCollectedTxt = "",
    vResult = bHighVerb ? {} : /* put here the default value for empty nodes: */ true,
    
    oAttrib, nAttrib, oNode, nItem, nLevelEnd, vBuiltVal, nElId, nAttrLen, sAPrefix, oAttrParent;

    if (bChildren) {
      for (nItem = 0; nItem < oParentNode.childNodes.length; nItem++) {
        oNode = oParentNode.childNodes.item(nItem);
        if (oNode.nodeType === 4) { sCollectedTxt += oNode.nodeValue; } /* nodeType is "CDATASection" (4) */
        else if (oNode.nodeType === 3) { sCollectedTxt += oNode.nodeValue.trim(); } /* nodeType is "Text" (3) */
        else if (oNode.nodeType === 1 && !oNode.prefix) { aCache.push(oNode); } /* nodeType is "Element" (1) */
      }
    }

    nLevelEnd = aCache.length;
    vBuiltVal = parseText(sCollectedTxt);

    if (!bHighVerb && (bChildren || bAttributes)) { vResult = nVerb === 0 ? objectify(vBuiltVal) : {}; }

    for (nElId = nLevelStart; nElId < nLevelEnd; nElId++) {
      sProp = aCache[nElId].nodeName.toLowerCase();
      vContent = createObjTree(aCache[nElId], nVerb, bFreeze, bNesteAttr);
      if (vResult.hasOwnProperty(sProp)) {
        if (vResult[sProp].constructor !== Array) { vResult[sProp] = [vResult[sProp]]; }
        vResult[sProp].push(vContent);
      } else {
        vResult[sProp] = vContent;
        nLength++;
      }
    }

    if (bAttributes) {
      nAttrLen = oParentNode.attributes.length;
      sAPrefix = bNesteAttr ? "" : sAttrPref;
      oAttrParent = bNesteAttr ? {} : vResult;

      for (nAttrib = 0; nAttrib < nAttrLen; nLength++, nAttrib++) {
        oAttrib = oParentNode.attributes.item(nAttrib);
        oAttrParent[sAPrefix + oAttrib.name.toLowerCase()] = parseText(oAttrib.value.trim());
      }

      if (bNesteAttr) {
        if (bFreeze) { Object.freeze(oAttrParent); }
        vResult[sAttributesProp] = oAttrParent;
        nLength -= nAttrLen - 1;
      }
    }

    if (nVerb === 3 || ((nVerb === 2 || (nVerb === 1 && nLength > 0)) && sCollectedTxt)) {
      vResult[sValueProp] = vBuiltVal;
    } else if (!bHighVerb && nLength === 0 && sCollectedTxt) {
      vResult = vBuiltVal;
    }

    if (bFreeze && (bHighVerb || nLength > 0)) { Object.freeze(vResult); }

    aCache.length = nLevelStart;

    return vResult;
  }

  function loadObjTree (oXMLDoc, oParentEl, oParentObj) {
    var vValue, oChild, sName, sAttrib, nItem;

    if (oParentObj instanceof String || oParentObj instanceof Number || oParentObj instanceof Boolean) {
      oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 */
    } else if (oParentObj.constructor === Date) {
      oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toGMTString()));    
    }

    for (sName in oParentObj) {
      vValue = oParentObj[sName];
      if (isFinite(sName) || vValue instanceof Function) { continue; } /* verbosity level is 0 */
      if (sName === sValueProp) {
        if (vValue !== null && vValue !== true) { oParentEl.appendChild(oXMLDoc.createTextNode(vValue.constructor === Date ? vValue.toGMTString() : String(vValue))); }
      } else if (sName === sAttributesProp) { /* verbosity level is 3 */
      for (sAttrib in vValue) { oParentEl.setAttribute(sAttrib, vValue[sAttrib]); }
      } else if (sName.charAt(0) === sAttrPref) {
        oParentEl.setAttribute(sName.slice(1), vValue);
      } else if (vValue.constructor === Array) {
        for (nItem = 0; nItem < vValue.length; nItem++) {
          oChild = oXMLDoc.createElement(sName);
          loadObjTree(oXMLDoc, oChild, vValue[nItem]);
          oParentEl.appendChild(oChild);
        }
      } else {
        oChild = oXMLDoc.createElement(sName);
        if (vValue instanceof Object) {
          loadObjTree(oXMLDoc, oChild, vValue);
        } else if (vValue !== null && vValue !== true) {
          oChild.appendChild(oXMLDoc.createTextNode(vValue.toString()));
        }
        oParentEl.appendChild(oChild);
      }
    }
  }

  exports = {
    /**
     * Builds a JS object out of an XML Document
     * @example
     * var myObject = JXON.build(doc);
     * JSON.stringify(myObject);
     */
    build : function (oXMLParent, nVerbosity /* optional */, bFreeze /* optional */, bNesteAttributes /* optional */) {
      var _nVerb = arguments.length > 1 && typeof nVerbosity === "number" ? nVerbosity & 3 : /* put here the default verbosity level: */ 1;
      return createObjTree(oXMLParent, _nVerb, bFreeze || false, arguments.length > 3 ? bNesteAttributes : _nVerb === 3);    
    },

    /**
     * Returns a Document from a JS object
     * @example
     * var newDoc = JXON.unbuild(myObject);
     * (new XMLSerializer()).serializeToString(newDoc);
     */
    unbuild : function (oObjTree) {    
      var oNewDoc = document.implementation.createDocument("", "", null);
      loadObjTree(oNewDoc, oNewDoc, oObjTree);
      return oNewDoc;
    }
  };

  return exports;
});

/*global global */
require([
        'nbd/Class',
        'nbd/Model',
        'nbd/View',
        'nbd/Controller',
        'nbd/Events',
        'nbd/trait/pubsub',
        'nbd/util/async',
        'nbd/util/pipe',
        'nbd/util/protochain',
        'nbd/util/jxon'
], function(Class, Model, View, Controller, Events, pubsub, async, pipe, protochain, jxon) {
  

  var exports = {
    Class : Class,
    Model : Model,
    View : View,
    Controller : Controller,
    Events : Events,
    trait : {
      pubsub : pubsub
    },
    util : {
      async : async,
      pipe : pipe,
      protochain : protochain,
      jxon : jxon
    }
  };

  global.nbd = exports;
});

define("build/all", function(){});
}(this));