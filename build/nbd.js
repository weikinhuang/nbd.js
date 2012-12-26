(function(global) {
/**
 * almond 0.2.3 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
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
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

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
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
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
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
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
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
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

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
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
/*global xyz */
define('nbd/Class',[],function() {
  

  var Klass, inherits, mixin,
  initializing = false, 
  fnTest = /xyz/.test(function(){return xyz;}) ? /\b_super\b/ : /.*/;

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
    var prop, result = false;
    if (typeof superclass === 'function') {
      // Testing linear inheritance
      return superclass.prototype.isPrototypeOf( this.prototype );
    }
    if (typeof superclass === 'object') {
      // Testing horizontal inheritance
      result = true;
      for (prop in superclass) {
        if (superclass.hasOwnProperty(prop) &&
            superclass[prop] !== this.prototype[prop]) {
          result = false;
          break;
        }
      }
    }
    return result;
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

define('nbd/util/extend',[],function() {
  

  return function(obj) {
    var i, prop, source;
    for (i=1; i<arguments.length; ++i) {
      source = arguments[i];
      for (prop in source) {
        obj[prop] = source[prop];
      }
    }
    return obj;
  };
});

define('nbd/util/diff',['nbd/util/extend'], function(extend) {
  

  var stack = [];

  function objectCheck(cur, prev) {
    var key, equal=true;

    for (key in cur) {
      if (cur[key] !== prev[key]) {
        return false;
      }

      if (cur[key] && cur.hasOwnProperty(key) && typeof cur[key] === "object") {
        // Property has been visited, skip
        if (stack.indexOf(cur[key]) >= 0 ) { continue; }

        try {
          stack.push(cur[key]);

          // Recurse into object to find diff
          equal = equal && objectCheck(prev[key], cur[key]);
        }
        catch (emptyArgs) {}
        finally {
          stack.pop();
        }
      }

      if (!equal) { return equal; }
    }

    return equal;
  }

  return function diff(cur, prev, callback) {
    var key, difference, differences = {};

    if (typeof prev !== "object" || typeof cur !== "object" ||
        prev === null || cur === null) {
      throw new TypeError('Arguments must be ojects');
    }

    // Make a copy of prev for its keys
    prev = extend({},prev);

    for (key in cur) {
      if (cur.hasOwnProperty(key)) {
        if (prev[key] !== cur[key] ||
            (typeof cur[key] === "object" && 
             cur[key] && 
             !objectCheck(cur[key], prev[key])
            )
           ) 
        {
          differences[key] = [cur[key], prev[key]];
          if (callback) {
            callback.apply(this, [key, cur[key], prev[key]]);
          }
        }

        delete prev[key];
      }
    }

    // Any remaining keys are only in the prev
    for (key in prev) {
      if (prev.hasOwnProperty(key)) {
        differences[key] = [cur[key]];
        if (callback) {
          callback.apply(this, [key, undefined, prev[key]]);
        }
      }
    }
    
    return differences;
  };
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

define('nbd/Model',['nbd/Class',
       'nbd/util/async',
       'nbd/util/extend',
       'nbd/util/diff',
       'nbd/trait/pubsub'
], function(Class, async, extend, diff, pubsub) {
  

  var dirtyCheck = function(old, novel) {
    if (!this._dirty) { return; }
    diff.call(this, novel, old, this.trigger);
    this._dirty = false;
  },

  constructor = Class.extend({

    init: function(id, data) {

      if ( typeof id === 'string' && id.match(/^\d+$/) ) {
        id = +id;
      }

      if ( data === undefined ) {
        data = id;
      }

      this.id = function() {
        return id;
      };

      Object.defineProperty(this, '_dirty', { writable: true });
      Object.defineProperty(this, '_data', {
        enumerable: false,
        configurable: true,
        value: data || {},
        writable: true
      });

    },

    destroy: function() {
      this.off(null);
    },

    data : function() {
      this._dirty = true;
      async(dirtyCheck.bind(this, extend({}, this._data), this._data));
      return this._data;
    },

    get: function(prop) {
      return this._data[prop];
    },

    set: function(values, value) {
      var key, data = this.data();

      if ( typeof values === "string" ) {
        data[values] = value;
        return this;
      }

      if ( typeof values === "object" ) {
        for ( key in values ) {
          if ( values.hasOwnProperty( key ) ) {
            data[key] = values[key];
          }
        }
        return this;
      }
    },

    toJSON: function() {
      return this._data;
    }
  })
  .mixin(pubsub);

  return constructor;

});

define('nbd/View',['nbd/Class'], function(Class) {
  

  var constructor = Class.extend({

    $view: null,

    render: function(data) {
      var $existing = this.$view;

      this.$view = this.template(data || this.templateData());

      if ( $existing && $existing.length ) {
        $existing.replaceWith( this.$view );
      }

      if(this.rendered) {
        this.rendered(this.$view);
      }

      return this.$view;
    },

    template: function() {},
    templateData: function() { return {}; },
    
    destroy: function() {
      if ( this.$view && this.$view.remove ) {
        this.$view.remove();
      }
      this.$view = null;
    }

  });

  return constructor;

});

/*jslint sloppy:true */
define('jquery',[],function() {
  return global.jQuery;
});

define('nbd/View/Entity',['jquery', 'nbd/View', 'nbd/Model'], function($, View, Model) {
  

  var constructor = View.extend({

    init : function( model ) {
    
      if ( model instanceof Model ) {
        this.Model = model;
        this.id = this.Model.id;
      }
      else {
        this.id = function() { return model; };
      }
    
    },
    
    // all data needed to template the view
    templateData : function() {
      return this.Model ? this.Model.data() : this.id();
    },
    
    render : function( $parent ) {

      // $existing could be a string
      var $existing = this.$view,
          fresh = !!$existing ^ !!$parent;

      // When there's either no rendered view XOR there isn't a parent
      if ( fresh ) {
        if (typeof $existing !== "string" ) {
          this.$view = this.template( this.templateData() );
        }
      }
      else if ( !$existing ) {
        return;
      }

      if (typeof $existing === "string") {
        this.$view = $(this.$view);
        fresh = !!$parent;
        if ( !fresh ) { return; }
      }

      if ( $parent ) {
        $parent.append( this.$view );
      }
      else {
        $existing.replaceWith( this.$view );
      }

      if ( fresh && typeof this.rendered === 'function' ) {
        this.rendered();
      }

      return this.$view;

    } // render
    
  }); // View Entity

  return constructor;

});

define('nbd/View/Element',['jquery', 'nbd/View'], function($, View) {
  

  var constructor = View.extend({

    $parent: null,

    init : function( $parent ) {
      this.$parent = $parent;
    },

    render : function( data ) {
      var exists = this.$view && this.$view.length;

      if (!exists) {
        this.$view = $('<div/>').appendTo(this.$parent);
      }

      this._super(data);

      return this.$view;
    }

  });

  return constructor;

});

define('nbd/Controller',['jquery', 'nbd/Class', 'nbd/View'],  function($, Class, View) {
  

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

define('nbd/Controller/Entity',['jquery', 'nbd/Controller'], function( $, Controller ) {
  

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

      Existing.destroy();
    
    } // switchView

  },{
    // Corresponding Entity View class
    VIEW_CLASS : null,

    // Corresponding Entity Model class
    MODEL_CLASS : null
  }); // Entity Controller

  return constructor;

});

define('nbd/event',['nbd/util/extend', 'nbd/trait/pubsub'], function(extend, pubsub) {
  

  var exports = extend({}, pubsub);

  // Aliases
  exports.bind = exports.on;
  exports.unbind = exports.off;
  exports.fire = exports.trigger;

  return exports;
});

define('nbd/trait/jquery.tmpl',['jquery'], function($) {
  

  return {

    template : function() {
      var script = this.templateScript();
      return script.tmpl.apply(script, arguments);
    },

    templateScript : function( strict ) {

      strict = ( typeof strict !== 'undefined' ) ? strict : true;

      if ( !this.constructor.$TEMPLATE || !this.constructor.$TEMPLATE.length ) {
        this.constructor.$TEMPLATE = $( '#' + this.constructor.TEMPLATE_ID );
      }

      if ( !this.constructor.$TEMPLATE.length ) {

        if ( strict === true ) {
          $.error( 'Missing template: ' + this.constructor.TEMPLATE_ID );
        }
        else {
          return false;
        }

      } // if !$TEMPLATE or !$TEMPLATE length

      return this.constructor.$TEMPLATE;

    }
  };

});

/**
 * Responsive media query callbacks
 * @see https://developer.mozilla.org/en-US/docs/DOM/Using_media_queries_from_code
 */
define('nbd/util/media',['nbd/util/extend', 'nbd/trait/pubsub'], function(extend, pubsub) {
  

  var mqChange, mediaCheck,
  matchMedia = window.matchMedia || window.msMatchMedia;

  function bindMedia( breakpoint, query ) {
    var match = window.matchMedia( query );
    match.addListener( mqChange.bind(match, breakpoint) );
    if (match.matches) { mqChange.call(match, breakpoint); }
  }

  mediaCheck = function media( options, query ) {
    var breakpoint;

    // No matchMedia support
    if ( !matchMedia ) {
      throw new Error('Media queries not supported.');
    }

    // Has matchMedia support
    if ( typeof options === 'string' ) {
      bindMedia( options, query );
      return media;
    }

    if ( typeof options === 'object' ) {
      for (breakpoint in options) {
        if (options.hasOwnProperty(breakpoint)) {
          query = options[breakpoint];
          bindMedia( breakpoint, query );
        }
      }
    }
    return media;

  };

  extend(mediaCheck, pubsub);

  mqChange = function(breakpoint) {
    mediaCheck.trigger(breakpoint + this.matches ? ':enter' : ':exit');
    mediaCheck.trigger(breakpoint);
  };

  return mediaCheck;

});

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

/*global global */
define('build/all',['nbd/Class',
       'nbd/Model',
       'nbd/View',
       'nbd/View/Entity',
       'nbd/View/Element',
       'nbd/Controller',
       'nbd/Controller/Entity',
       'nbd/event',
       'nbd/trait/pubsub',
       'nbd/trait/jquery.tmpl',
       'nbd/util/async',
       'nbd/util/diff',
       'nbd/util/extend',
       'nbd/util/media',
       'nbd/util/pipe',
       'nbd/util/protochain'
], function(Class, Model, View, EntityView, ElementView, Controller, Entity, event, pubsub, jqtmpl, async, diff, extend, media, pipe, protochain) {
  

  var exports = {
    Class : Class,
    Model : Model,
    View : View,
    Controller : Controller,
    event : event,
    trait : {
      pubsub : pubsub,
      'jquery.tmpl' : jqtmpl
    },
    util : {
      async : async,
      diff : diff,
      extend : extend,
      media : media,
      pipe : pipe,
      protochain : protochain
    }
  };

  exports.View.Element = ElementView;
  exports.View.Entity = EntityView;
  exports.Controller.Entity = Entity;

  global.nbd = exports;
  return exports;
});
}(this));