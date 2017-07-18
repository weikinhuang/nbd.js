(function(root) {
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

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
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
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
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
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

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
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
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
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

            ret = callback ? callback.apply(defined[name], args) : undefined;

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
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

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
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

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

define("node_modules/almond/almond", function(){});

define('nbd/util/mixin',[],function() {
  'use strict';

  return function mixin(target, abstract) {
    var descriptor = {};
    Object.keys(abstract).forEach(function(prop) {
      descriptor[prop] = Object.getOwnPropertyDescriptor(abstract, prop);
    });
    Object.defineProperties(target, descriptor);
  };
});

define('nbd/Class',['./util/mixin'], function(mix) {
  'use strict';

  // The base Class implementation (does nothing)
  var Klass = function() {},
  extend, mixin, inherits,
  fnTest = /xyz/.test(function() {/*global xyz*/ return xyz; }) ?
    /\b_super\b/ :
    /.*/;

  // allows adding any object's properties into the class
  mixin = function() {
    for (var i = 0; i < arguments.length; ++i) {
      mix(this.prototype, arguments[i]);
    }
    return this;
  };

  // determines if current class inherits from superclass
  inherits = function(superclass) {
    var prop, result = false;
    if (typeof superclass === 'function') {
      // Testing linear inheritance
      return superclass.prototype.isPrototypeOf(this.prototype);
    }
    if (typeof superclass === 'object') {
      // Testing horizontal inheritance
      for (prop in superclass) {
        if (superclass.hasOwnProperty(prop) &&
            superclass[prop] !== this.prototype[prop]) {
          return false;
        }
        result = true;
      }
    }
    return result;
  };

  // Create a new Class that inherits from this class
  extend = function(prop, stat) {
    var _super = this.prototype,
    copy = function(name) { Class[name] = this[name]; },

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    prototype = Object.create(_super);
    prop = prop || {};
    stat = stat || {};

    function protochain(name, fn) {
      var applySuper = function() {
        return _super[name].apply(this, arguments);
      };
      return function() {
        var hadSuper = this.hasOwnProperty('_super'), tmp = this._super;

        // Add a new ._super() method that is the same method
        // but on the super-class
        this._super = applySuper;

        // The method only need to be bound temporarily, so we
        // remove it when we're done executing
        try {
          return fn.apply(this, arguments);
        }
        catch(e) {
          // Rethrow catch for IE 8
          throw e;
        }
        finally {
          if (hadSuper) {
            this._super = tmp;
          }
          else {
            delete this._super;
          }
        }
      };
    }

    // The dummy class constructor
    function Class() {
      var ret,
      instance = this instanceof Class ?
        this :
        Object.create(prototype);
      // All construction is actually done in the init method
      if (typeof instance.init === 'function') {
        ret = instance.init.apply(instance, arguments);
        return Object(ret) === ret ? ret : instance;
      }
      return instance;
    }

    // Copy the properties over onto the new prototype
    Object.keys(prop).forEach(function(name) {
      var p = prop[name];
      // Check if we're overwriting an existing function
      prototype[name] =
        typeof p === 'function' &&
        typeof _super[name] === 'function' &&
        fnTest.test(p) ?
        protochain(name, p) :
        p;
    });

    // Copy the superclass's static properties
    Object.keys(this).forEach(copy, this);

    // Override the provided static properties
    Object.keys(stat).forEach(copy, stat);

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Object.defineProperty(Class.prototype, 'constructor', { value: Class });

    // Class guaranteed methods
    Object.defineProperties(Class, {
      extend: { value: extend, enumerable: false },
      mixin: { value: mixin },
      inherits: { value: inherits }
    });

    return Class;
  };

  Klass.extend = extend;

  return Klass;
});

/**
 * Utility function to break out of the current JavaScript callstack
 * @see https://github.com/NobleJS/setImmediate
 * @module util/async
 */
define('nbd/util/async',[],function() {
  'use strict';

  var global = typeof global !== 'undefined' ? global :
               typeof window !== 'undefined' ? window :
               this,
      async;

  var tasks = (function () {
    function Task(handler, args) {
      this.handler = handler;
      this.args = args;
    }
    Task.prototype.run = function () {
      // See steps in section 5 of the spec.
      if (typeof this.handler === "function") {
        // Choice of `thisArg` is not in the setImmediate spec; `undefined` is in the setTimeout spec though:
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html
        this.handler.apply(undefined, this.args);
      }
      else {
        var scriptSource = String(this.handler);
        /*jshint evil: true */
        eval(scriptSource);
      }
    };

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;

    return {
      addFromSetImmediateArguments: function (args) {
        var handler = args[0];
        var argsToHandle = Array.prototype.slice.call(args, 1);
        var task = new Task(handler, argsToHandle);

        var thisHandle = nextHandle++;
        tasksByHandle[thisHandle] = task;
        return thisHandle;
      },
      runIfPresent: function (handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (!currentlyRunningATask) {
          var task = tasksByHandle[handle];
          if (task) {
            currentlyRunningATask = true;
            try {
              task.run();
            } finally {
              delete tasksByHandle[handle];
              currentlyRunningATask = false;
            }
          }
        }
        else {
          // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
          // "too much recursion" error.
          global.setTimeout(function () {
            tasks.runIfPresent(handle);
          }, 0);
        }
      },
      remove: function (handle) {
        delete tasksByHandle[handle];
      }
    };
  }());

  /* Feature detectors */
  function canUseNextTick() {
    // Don't get fooled by e.g. browserify environments.
    return typeof process === "object" &&
      Object.prototype.toString.call(process) === "[object process]";
  }

  function canUseMessageChannel() {
    return !!global.MessageChannel;
  }

  function canUsePostMessage() {
    // The test against `importScripts` prevents this implementation from being installed inside a web worker,
    // where `global.postMessage` means something completely different and can't be used for this purpose.

    if (!global.postMessage || global.importScripts) {
      return false;
    }

    var postMessageIsAsynchronous = true;
    var oldOnMessage = global.onmessage;
    global.onmessage = function () {
      postMessageIsAsynchronous = false;
    };
    global.postMessage("", "*");
    global.onmessage = oldOnMessage;

    return postMessageIsAsynchronous;
  }

  function canUseReadyStateChange() {
    return "document" in global && "onreadystatechange" in global.document.createElement("script");
  }

  /* Implementations */
  function nextTickImplementation() {
    return function () {
      var handle = tasks.addFromSetImmediateArguments(arguments);

      process.nextTick(function () {
        tasks.runIfPresent(handle);
      });

      return handle;
    };
  }

  function messageChannelImplementation() {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = function (event) {
      var handle = event.data;
      tasks.runIfPresent(handle);
    };
    return function () {
      var handle = tasks.addFromSetImmediateArguments(arguments);

      channel.port2.postMessage(handle);

      return handle;
    };
  }

  function postMessageImplementation() {
    // Installs an event handler on `global` for the `message` event: see
    // * https://developer.mozilla.org/en/DOM/window.postMessage
    // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

    var MESSAGE_PREFIX = "async-message" + Math.random();

    function isStringAndStartsWith(string, putativeStart) {
      return typeof string === "string" && string.substring(0, putativeStart.length) === putativeStart;
    }

    function onGlobalMessage(event) {
      // This will catch all incoming messages (even from other windows!), so we need to try reasonably hard to
      // avoid letting anyone else trick us into firing off. We test the origin is still this window, and that a
      // (randomly generated) unpredictable identifying prefix is present.
      if (event.source === global && isStringAndStartsWith(event.data, MESSAGE_PREFIX)) {
        var handle = event.data.substring(MESSAGE_PREFIX.length);
        tasks.runIfPresent(handle);
      }
    }
    if (global.addEventListener) {
      global.addEventListener("message", onGlobalMessage, false);
    }
    else {
      global.attachEvent("onmessage", onGlobalMessage);
    }

    return function () {
      var handle = tasks.addFromSetImmediateArguments(arguments);

      // Make `global` post a message to itself with the handle and identifying prefix, thus asynchronously
      // invoking our onGlobalMessage listener above.
      global.postMessage(MESSAGE_PREFIX + handle, "*");

      return handle;
    };
  }

  function readyStateChangeImplementation() {
    return function () {
      var handle = tasks.addFromSetImmediateArguments(arguments);

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement("script");
      scriptEl.onreadystatechange = function () {
        tasks.runIfPresent(handle);

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);

      return handle;
    };
  }

  function setTimeoutImplementation() {
    return function () {
      var handle = tasks.addFromSetImmediateArguments(arguments);

      global.setTimeout(function () {
        tasks.runIfPresent(handle);
      }, 0);

      return handle;
    };
  }

  if (!global.setImmediate) {

    if (canUseNextTick()) {
      // For Node.js before 0.9
      async = nextTickImplementation();
    }
    else if (canUsePostMessage()) {
      // For non-IE10 modern browsers
      async = postMessageImplementation();
    }
    else if (canUseMessageChannel()) {
      // For web workers, where supported
      async = messageChannelImplementation();
    }
    else if (canUseReadyStateChange()) {
      // For IE 6–8
      async = readyStateChangeImplementation();
    }
    else {
      // For older browsers
      async = setTimeoutImplementation();
    }

    async.clearImmediate = tasks.remove;
  }
  else {
    async = global.setImmediate;
    async.clearImmediate = global.clearImmediate.bind(null);
  }

  return async;
});

define('nbd/util/extend',[],function() {
  'use strict';

  return function(obj) {
    var i, prop, source;
    for (i = 1; i < arguments.length; ++i) {
      source = arguments[i];
      for (prop in source) {
        obj[prop] = source[prop];
      }
    }
    return obj;
  };
});

define('nbd/util/diff',['./extend'], function(extend) {
  'use strict';

  var stack = [];

  function isObject(obj) {
    var proto;
    return obj && typeof obj === "object" &&
      (proto = Object.getPrototypeOf(obj),
       proto === Object.prototype ||
       proto === Array.prototype);
  }

  function objectCheck(cur, prev) {
    var key, equal = true;

    // If not objects, assume different
    if (!(isObject(cur) && isObject(prev))) { return false; }

    for (key in cur) {
      if (cur[key] === prev[key]) { continue; }

      if (isObject(cur[key]) && cur[key] && isObject(prev[key]) && prev[key]) {
        // Property has been visited, skip
        if (~stack.indexOf(cur[key])) { continue; }

        try {
          stack.push(cur[key]);

          // Recurse into object to find diff
          equal = equal && objectCheck(cur[key], prev[key]);
        }
        catch (emptyArgs) {}
        finally {
          stack.pop();
        }
      } else { equal = false; }

      if (!equal) { return equal; }
    }

    // Remaining keys in prev means it's different
    for (key in prev) {
      if (key in cur) { continue; }
      return false;
    }

    return equal;
  }

  return function diff(cur, prev, callback) {
    var key, lhs, rhs, differences = {};

    if (!(isObject(cur) && isObject(prev))) {
      throw new TypeError('Arguments must be objects');
    }

    // Make a copy of prev for its keys
    prev = extend({}, prev);

    for (key in cur) {
      if (cur.hasOwnProperty(key)) {
        lhs = cur[key];
        rhs = prev[key];
        delete prev[key];

        if (lhs === rhs) { continue; }

        // if either is not a simple object OR objectCheck fails then mark
        if (!(
          typeof lhs === "object" && typeof rhs === "object" &&
          lhs && rhs &&
          objectCheck(lhs, rhs)
       )) {
          differences[key] = [lhs, rhs];
          if (callback) {
            callback.call(this, key, lhs, rhs);
          }
        }
      }
    }

    // Any remaining keys are only in the prev
    for (key in prev) {
      if (prev.hasOwnProperty(key) && prev[key] !== undefined) {
        differences[key] = [cur[key], prev[key]];
        if (callback) {
          callback.call(this, key, undefined, prev[key]);
        }
      }
    }

    return differences;
  };
});

define('nbd/util/curry',[],function() {
  'use strict';

  var toStr = Object.prototype.toString;

  return function() {
    var fn = this,
        rest = arguments,
        type = toStr.call(fn);
    if (type !== '[object Function]') { throw new TypeError("curry called on incompatible "+type); }
    return function() {
      Array.prototype.unshift.apply(arguments, rest);
      return fn.apply(this, arguments);
    };
  };
});

define('nbd/trait/pubsub',['../util/curry'], function(curry) {
  'use strict';

  // Regular expression used to split event strings
  var slice = Array.prototype.slice,
  eventSplitter = /\s+/,

  splitCaller = curry.bind(function(fn, map) {
    if (map == null) {
      fn.apply(this, slice.call(arguments, 1));
      return this;
    }

    var rest = slice.call(arguments, 2),
        keys = typeof map === 'object' ?  Object.keys(map) : [map],
        front = [],
        event, i;

    for (i = 0; i < keys.length; ++i) {
      event = keys[i].split(eventSplitter);
      if (typeof map === 'object') {
        front[1] = map[keys[i]];
      }
      while ((front[0] = event.shift())) {
        fn.apply(this, front.concat(rest));
      }
    }
    return this;
  }),

  addEntry = function(event, callback, context, once) {
    if (!this._events) {
      Object.defineProperty(this, '_events', {
        configurable: true,
        value: {},
        writable: true
      });
    }

    this._events[event] = (this._events[event] || []).concat({
      fn: callback,
      ctxt: context,
      self: this,
      once: once
    });

    return this;
  },

  uId = function uid(prefix) {
    uid.i = uid.i || 0;
    return (prefix || '') + (++uid.i);
  };

  return {
    on: splitCaller(function(event, callback, context) {
      if (!callback) { return this; }
      return addEntry.call(this, event, callback, context);
    }),

    one: splitCaller(function(event, callback, context) {
      if (!callback) { return this; }
      return addEntry.call(this, event, callback, context, true);
    }),

    off: splitCaller(function(event, callback, context) {
      var calls, events, i;

      function entryTest(entry) {
        return (callback && entry.fn !== callback) ||
          (context && entry.ctxt !== context);
      }

      // No events, or removing *all* events.
      if (!(calls = this._events)) { return this; }
      if (!(event || callback || context)) {
        delete this._events;
        return this;
      }

      events = event ? [event] : Object.keys(calls);
      for (i = 0; i < events.length; ++i) {
        if ((event = events[i]) && calls[event]) {
          calls[event] = calls[event].filter(entryTest);
          if (!calls[event].length) {
            delete calls[event];
          }
        }
      }
    }),

    trigger: splitCaller(function(event) {
      if (!this._events) { return this; }
      var events = this._events[event],
          all = this._events.all,
          args = slice.call(arguments, 1),
          entry, index;

      if (events) {
        for (index = 0; entry = events[index]; ++index) {
          if (entry.once) {
            events.splice(index--, 1);
          }
          entry.fn.apply(entry.ctxt || entry.self, args);
        }
      }
      if (all) {
        for (index = 0; entry = all[index]; ++index) {
          if (entry.once) {
            all.splice(index--, 1);
          }
          entry.fn.apply(entry.ctxt || entry.self, arguments);
        }
      }

      return this;
    }),

    // An inversion-of-control version of `on`. Tell *this* object to listen to
    // an event in another object ... keeping track of what it's listening to.
    listenTo: function(object, events, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = object._listenerId || (object._listenerId = uId('l'));
      listeners[id] = object;
      object.on(events, callback || this, this);
      return this;
    },

    listenOnce: function(object, events, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = object._listenerId || (object._listenerId = uId('l'));
      listeners[id] = object;
      object.one(events, callback || this, this);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(object, events, callback) {
      var listeners = this._listeners;
      if (!listeners) { return this; }
      if (object) {
        object.off(events, callback, this);
        if (!(events || callback)) { delete listeners[object._listenerId]; }
      }
      else {
        for (var id in listeners) {
          listeners[id].off(null, null, this);
        }
        this._listeners = {};
      }
      return this;
    },

    relay: function(object, events) {
      events = events.split(eventSplitter);
      var i;
      for (i = 0; i < events.length; ++i) {
        if (events[i] === 'all') {
          this.listenTo(object, events[i], this.trigger);
        }
        this.listenTo(object, events[i], this.trigger.bind(this, events[i]));
      }
      return this;
    }
  };
});

define('nbd/Model',[
  './Class',
  './util/async',
  './util/extend',
  './util/diff',
  './trait/pubsub'
], function(Class, async, extend, diff, pubsub) {
  "use strict";

  function copy(a) {
    if (a != null && typeof a === 'object') {
      return Array.isArray(a) ? Array.prototype.slice.call(a) :
        a.constructor === Object ? extend({}, a) :
        a;
    }
    return a;
  }

  function isNumeric(n) {
    return !(isNaN(n) || n !== 0 && !n);
  }

  var dirtyCheck = function(old, novel) {
    this._dirty = 0;
    diff.call(this, novel || this._data, old, this.trigger);
  },

  constructor = Class.extend({
    init: function(id, data) {
      if (isNumeric(id)) {
        id = +id;
      }

      if (data === undefined && typeof id === 'object') {
        data = id;
        id = undefined;
      }

      this.get = this.get.bind(this);
      this.set = this.set.bind(this);

      try {
        Object.defineProperties(this, {
          _id: {
            value: id
          },
          _dirty: {
            value: 0,
            writable: true
          },
          _data: {
            enumerable: false,
            configurable: true,
            value: extend({}, this.default, data),
            writable: true
          }
        });
      }
      catch (noDefineProperty) {
        // Can't use ES5 Object.defineProperty, fallback
        this._dirty = 0;
        this._data = data || {};
      }
    },

    destroy: function() {
      this.stopListening().off();
      async.clearImmediate(this._dirty);
      this._data = null;
    },

    id: function() {
      return this._id;
    },

    data: function() {
      var orig = this._data, clone;

      if (!this._dirty) {
        clone = Object.keys(orig).reduce(function(obj, key) {
          return obj[key] = copy(orig[key]), obj;
        }, {});
        this._dirty = async(dirtyCheck.bind(this, clone));
      }
      return this._data;
    },

    get: function(prop) {
      var value = this._data[prop];
      // If getting an array, we must watch for array mutators
      if (Array.isArray(value)) {
        return this.data()[prop];
      }
      return value;
    },

    set: function(values, value) {
      var key, data = this.data();

      if (typeof values === "string") {
        data[values] = copy(value);
        return this;
      }

      if (typeof values === "object") {
        for (key in values) {
          if (values.hasOwnProperty(key)) {
            data[key] = copy(values[key]);
          }
        }
        return this;
      }
    },

    toJSON: function() {
      return this._data;
    }
  }, {
    displayName: 'Model'
  })
  .mixin(pubsub);

  return constructor;
});

define('nbd/View',[
  './Class',
  './trait/pubsub'
], function(Class, pubsub) {
  "use strict";

  var shadow = document.createDocumentFragment(),
  renderMatching = function(key) {
    if (!this.$view) { return; }
    var selector = this.nests[key],
    contained = this._model.get ? this._model.get(key) : this._model[key],
    $context = this.constructor.find(this.$view, selector);

    if (!$context) { return; }
    if (contained && contained.render) {
      contained.render($context);
    }
  };

  var constructor = Class.extend({
    init: function(model) {
      this._model = model || {};

      if (model && typeof model.id === 'function') {
        this.id = function() {
          return model.id();
        };
      }

      if (model && model.on) {
        this.listenTo(this._model, 'all', this._switchNested);
      }
      this.on({
        prerender: function() {
          if (typeof this.prerender === 'function') {
            this.prerender();
          }
        },
        postrender: function($view) {
          // Entity nesting
          if (this.nests) {
            Object.keys(this.nests).forEach(renderMatching, this);
          }
          // Back-compat for view.rendered()
          if (typeof this.rendered === 'function') {
            this.rendered($view);
          }
          if (typeof this.postrender === 'function') {
            this.postrender($view);
          }
        }
      });
    },

    destroy: function() {
      this.constructor.remove(this.$view);
      this.$view = null;
      this.off().stopListening();
    },

    template: function() {},

    // All data needed to template the view
    templateData: function() {
      return (this._model && this._model.data) ? this._model.data() : this._model;
    },

    render: function($parent) {
      var $existing = this.$view,
          fresh = !($existing && $parent);

      if (fresh) {
        this.trigger('prerender', $existing);
        this.$view = this.constructor.domify(this.template(this.templateData()));
      }

      if ($parent) {
        this.constructor.appendTo(this.$view, $parent);
      }
      else {
        this.constructor.replace($existing, this.$view);
      }

      if (fresh) {
        this.trigger('postrender', this.$view);
      }

      return this.$view;
    },

    _switchNested: function(key, val, old) {
      if (this.nests != null && key in this.nests) {
        if (old && old.render) { old.render(shadow); }
        renderMatching.call(this, key);
      }
    }
  }, {
    displayName: 'View',
    domify: function(html) {
      var container;
      if (typeof html === 'string') {
        container = document.createElement('div');
        container.innerHTML = html;
        return container.removeChild(container.childNodes[0]);
      }

      return html;
    },

    appendTo: function($child, $parent) {
      if (!($child && $parent)) { return; }
      if ($child.appendTo) {
        return $child.appendTo($parent);
      }
      return ($parent.append || $parent.appendChild).call($parent, $child);
    },

    find: function($root, selector) {
      if (!$root) { return; }
      if (!selector) { return $root; }
      return ($root.find || $root.querySelector).call($root, selector);
    },

    replace: function($old, $new) {
      if (!$old) { return; }
      if ($old.replaceWith) {
        return $old.replaceWith($new);
      }
      return $old.parentNode &&
        $old.parentNode.replaceChild($new, $old);
    },

    remove: function($el) {
      if (!$el) { return; }
      if ($el.remove) {
        return $el.remove();
      }
      return $el.parentNode &&
        $el.parentNode.removeChild($el);
    }
  })
  .mixin(pubsub);

  return constructor;
});

define('nbd/View/Entity',['../View'], function(View) {
  'use strict';

  console.warn('nbd/View/Entity is deprecated. Use nbd/View');
  return View.extend();
});

define('nbd/View/Element',['../View'], function(View) {
  "use strict";

  var constructor = View.extend({
    $parent: null,

    init: function($parent) {
      this._super();
      this.$parent = $parent;
    },

    render: function(data) {
      var $existing = this.$view;

      this.trigger('prerender', $existing);

      this.$view = this.constructor.domify(this.template(data || this.templateData()));

      if ($existing) {
        this.constructor.replace($existing, this.$view);
      }
      else {
        this.constructor.appendTo(this.$view, this.$parent);
      }

      this.trigger('postrender', this.$view);

      return this.$view;
    }
  }, {
    displayName: 'View/Element'
  });

  return constructor;
});

define('nbd/util/construct',[],function() {
  'use strict';

  var toStr = Object.prototype.toString;

  return function construct() {
    // Type check this is a function
    if (!~toStr.call(this).indexOf('Function')) {
      throw new TypeError('construct called on incompatible Object');
    }

    var inst = Object.create(this.prototype),
    ret = this.apply(inst, arguments);
    // Follow new behavior when constructor returns a value
    return Object(ret) === ret ? ret : inst;
  };
});

define('nbd/Logger',[
  './Class',
  './trait/pubsub',
  './util/construct'
], function(Class, pubsub, construct) {
  'use strict';

  var _logHandlers = [],
  _levels = {
    debug: true,
    log:  true,
    info: true,
    warn: true,
    error: true
  },

  Logger = Class.extend({
    init: function(name) {
      if (typeof name === 'string') {
        this.name = name;
      }
      else {
        this.container = name;
      }

      this.levels.forEach(function(level) {
        this[level] = this._log.bind(this, level);
      }, this);

      Object.defineProperty(this, 'level', {
        writable: true,
        value: 0
      });

      if (!this.hasOwnProperty('log')) {
        this.log = this[this.levels[0]];
      }
    },

    destroy: function() {
      this.off();
      this.container = null;
    },

    levels: ['debug', 'log', 'info', 'warn', 'error'],

    setLevel: function(level) {
      var i;
      if (~(i = this.levels.indexOf(level))) {
        this.level = i;
      }
    },

    attach: function(route) {
      this.on('all', route);
    },

    remove: function(route) {
      this.off(null, route);
    },

    _log: function(level) {
      var i, params;

      if ((i = this.levels.indexOf(level)) < this.level) { return; }

      params = Array.prototype.slice.call(arguments, 1);
      this.trigger(this.levels[i], {
        context: this._name(),
        params: params
      });
    },

    _name: function() {
      var local = this.container &&
        Object.getPrototypeOf(this.container).constructor;
      return this.name || local && (local.displayName || local.name);
    }
  }, {
    displayName: 'Logger',

    get: function(name) {
      var logger = construct.call(this, name);
      logger.attach(this.global);
      return logger;
    },

    attach: function(handler) {
      if (typeof handler === 'function') {
        _logHandlers.push(handler);
      }
    },

    setLevel: function splat(level, handler) {
      var key;
      if (typeof level === 'string') {
        _levels[level] = typeof handler === 'function' ? handler : !!handler;
      }
      else if (typeof level === 'object') {
        for (key in level) {
          splat(key, level[key]);
        }
      }
    },

    global: function(level, message) {
      var allowed = _levels[level];
      allowed = !!(typeof allowed === 'function' ? allowed(message) : allowed);
      return allowed && _logHandlers.forEach(function(handler) {
        handler(level, message);
      });
    },

    console: function(level, message) {
      var params = message.params;
      if (message.context) {
        params = ['%c' + message.context, 'color:gray'].concat(params);
      }
      return console[level] && console[level].apply(console, params);
    }
  })
  .mixin(pubsub);

  Logger.attach(Logger.console);

  return Logger;
});

define('nbd/Promise',['./util/async', './util/construct', './util/extend', './Logger'], function(async, construct, extend, Logger) {
  'use strict';

  var logger = Logger.get('Promise');

  function PromiseResolver(promise) {
    var fulfills = [],
        rejects = [],
        state = 0,
        handled = 0,
        value;

    function call(fns, value) {
      async(function() {
        for (var i = 0; i < fns.length; ++i) { fns[i](value); }
        if (!handled && state === -1) {
          logger.warn('Unhandled rejection', value);
        }
        fulfills.length = rejects.length = 0;
      });
    }

    function fulfill(x) {
      if (state) { return; }
      state = 1;
      value = x;
      call(fulfills, value);
    }

    function reject(reason) {
      if (state) { return; }
      state = -1;
      value = reason;
      call(rejects, value);
      handled |= rejects.length;
    }

    function resolve(x) {
      if (x === promise) {
        reject(new TypeError('Cannot resolve with self'));
      }

      // If handed another promise
      if (Promise.isPromise(x)) {
        x.then(resolve, reject);
        return;
      }

      // If handed another then-able
      if ((typeof x === 'object' || typeof x === 'function') && x !== null) {
        var then, mutex = false;

        try {
          then = x.then;
        }
        catch (e) {
          reject(e);
          return;
        }

        if (typeof then === 'function') {
          try {
            then.call(x, function resolvePromise(y) {
              if (mutex) { return; }
              (y === x ? fulfill : resolve)(y);
              mutex = true;
            }, function rejectPromise(r) {
              if (mutex) { return; }
              reject(r);
              mutex = true;
            });
          }
          catch (e) { if (!mutex) { reject(e); } }
          return;
        }
      }

      fulfill(x);
    }

    promise.then = function then(onFulfill, onReject) {
      var next = new Promise();

      function wrap(fn) {
        return function(x) {
          var retval;
          try {
            retval = fn(x);
          }
          catch(e) {
            next.reject(e);
          }
          next.resolve(retval);
        };
      }

      // Promise pending
      if (!state) {
        fulfills.push(typeof onFulfill === 'function' ?
                       wrap(onFulfill) :
                       next.resolve);

        rejects.push(typeof onReject === 'function' ?
                      wrap(onReject) :
                      next.reject);
      }
      // Promise fulfilled/rejected
      else {
        var toCall = ~state ? onFulfill : onReject;
        if (typeof toCall === 'function') {
          toCall = wrap(toCall);
          handled |= state === -1;
          async(function() { toCall(value); });
        }
        else {
          next[~state ? 'resolve' : 'reject'](value);
        }
      }

      return next;
    };

    Object.defineProperties(this, {
      fulfill: { enumerable: true, value: fulfill },
      reject: { enumerable: true, value: reject },
      resolve: { enumerable: true, value: resolve }
    });
  }

  function Promise(callback) {
    if (!(this instanceof Promise)) {
      return new Promise(callback);
    }

    var resolver = new PromiseResolver(this);

    if (typeof callback === 'function') {
      try { callback(resolver.resolve, resolver.reject); }
      catch(failure) {
        resolver.reject(failure);
      }
    }
    else {
      this.resolve = resolver.resolve;
      this.reject = resolver.reject;
    }
  }

  var forEach = Array.prototype.forEach;

  function join(p1, p2) {
    return p1.then(function() { return p2; });
  }

  extend(Promise.prototype, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },

    finally: function(onAny) {
      return this.then(onAny, onAny);
    },

    done: function(onFulfill, onReject) {
      return this.then(onFulfill, onReject)
      .catch(function(reason) {
        setTimeout(function() {
          throw reason;
        }, 0);
      });
    },

    spread: function(onFulfill, onReject) {
      return this.then(function(arr) {
        return onFulfill.apply(this, arr);
      }, onReject);
    },

    get: function(name) {
      return this.then(function(x) {
        return x[name];
      });
    },

    set: function(name, value) {
      return this.then(function(x) {
        x[name] = value;
        return x;
      });
    },

    delete: function(name) {
      return this.then(function(x) {
        delete x[name];
        return x;
      });
    },

    send: function(name) {
      var args = Array.prototype.slice.call(arguments, 1);
      return this.then(function(x) {
        return x[name].apply(x, args);
      });
    },

    fcall: function() {
      var args = arguments;
      return this.then(function(fn) {
        return fn.apply(undefined, args);
      });
    },

    thenable: function() {
      return { then: this.then };
    },

    promise: function() {
      var then = this.then,
      retSelf = function() { return api; },
      api = {
        done: function() {
          forEach.call(arguments, function(fn) { then(fn); });
          return api;
        },
        fail: function() {
          forEach.call(arguments, function(fn) { then(undefined, fn); });
          return api;
        },
        always: function() {
          forEach.call(arguments, function(fn) { then(fn, fn); });
          return api;
        },
        then: then,
        progress: retSelf,
        promise: retSelf
      };

      return api;
    }
  });

  extend(Promise, {
    from: function(value) {
      if (Promise.isPromise(value)) { return value; }
      return Promise.resolve(value);
    },

    resolve: function(value) {
      return new this(function(resolve) {
        resolve(value);
      });
    },

    reject: function(reason) {
      return new this(function(resolve, reject) {
        reject(reason);
      });
    },

    race: function(iterable) {
      var r, j, p = new this(function(resolve, reject) { r = resolve; j = reject; });
      if (!arguments.length) {
        throw new Error('Not enough arguments to Promise.race');
      }

      if (!iterable.length) {
        r();
        return p;
      }
      Array.prototype.map.call(iterable, function(value) {
        this.from(value).then(r, j);
      }, this);
      return p;
    },

    all: function(iterable) {
      var r, j, p = new this(function(resolve, reject) { r = resolve; j = reject; }),
      results = [];

      function collect(index, retval) {
        results[index] = retval;
      }

      if (!arguments.length) {
        throw new Error('Not enough arguments to Promise.all');
      }

      if (!iterable.length) {
        r();
        return p;
      }

      results.map.call(iterable, function(value, i) {
        return Promise.from(value).then(collect.bind(null, i));
      })
      .reduce(join)
      .then(r.bind(null, results), j);

      return p;
    },

    isPromise: function(x) {
      return x instanceof Promise;
    },

    isThenable: function(x) {
      if ((typeof x === 'object' || typeof x === 'function') && x !== null) {
        var then = x.then;
        return typeof then === 'function';
      }
      return false;
    }
  });

  return Promise;
});

define('nbd/Controller',[
  './util/construct',
  './Class',
  './View',
  './Model',
  './Promise',
  './trait/pubsub'
], function(construct, Class, View, Model, Promise, pubsub) {
  'use strict';

  var constructor = Class.extend({
    init: function() {
      this._initModel.apply(this, arguments);
      this.requestView();
    },

    render: function($parent, ViewClass) {
      this.requestView(ViewClass);
      return new Promise(function(resolve) {
        resolve(this._view.render($parent));
      }.bind(this));
    },

    destroy: function() {
      if (this._view) { this._view.destroy(); }
      this._model.destroy();
      this._model = this._view = null;
      this.trigger('destroy').stopListening().off();
    },

    _initModel: function() {
      var ModelClass = this.Model || this.constructor.MODEL_CLASS;
      this._model = construct.apply(ModelClass, arguments);
    },

    _initView: function() {
      var ViewClass = Array.prototype.shift.call(arguments);
      this._view = construct.apply(ViewClass, arguments);
      this._view._controller = this;
    },

    switchView: function() {
      var existing = this._view;
      this._initView.apply(this, arguments);

      if (!existing) { return; }

      if (existing.$view) {
        this._view.$view = existing.$view;
        this._view.render();
      }

      if (existing.destroy) {
        existing.destroy();
      }
    },

    requestView: function(ViewClass) {
      ViewClass = ViewClass || this.View || this.constructor.VIEW_CLASS;

      if (typeof ViewClass === 'string') {
        ViewClass = this.constructor.VIEW_CLASS[ViewClass];
      }
      if (typeof ViewClass !== 'function' || this._view instanceof ViewClass) {
        return;
      }
      this.switchView(ViewClass, this._model);
    },

    toJSON: function() {
      return this._model.toJSON();
    }
  }, {
    displayName: 'Controller',
    // Corresponding Entity View class
    VIEW_CLASS: View,

    // Corresponding Entity Model class
    MODEL_CLASS: Model
  })
  .mixin(pubsub)
  .mixin({
    get id() {
      return this._model.id();
    },
    get data() {
      return this._model.data();
    }
  });

  return constructor;
});

define('nbd/Controller/Entity',['../Controller'], function(Controller) {
  'use strict';

  console.warn('nbd/Controller/Entity is deprecated. Use nbd/Controller');
  return Controller.extend();
});

/**
 * Responsive media query callbacks
 * @see https://developer.mozilla.org/en-US/docs/DOM/Using_media_queries_from_code
 */
/*global matchMedia, msMatchMedia */
define('nbd/util/media',['./extend', '../trait/pubsub'], function(extend, pubsub) {
  'use strict';

  var queries = {},
  mqChange,
  mMedia = typeof matchMedia !== 'undefined' ? matchMedia :
           typeof msMatchMedia !== 'undefined' ? msMatchMedia :
           null;

  function bindMedia(breakpoint, query) {
    var match;
    if (match = queries[breakpoint]) {
      match.removeListener(match.listener);
    }

    match = mMedia(query);
    match.listener = mqChange.bind(match, breakpoint);
    match.addListener(match.listener);
    queries[breakpoint] = match;
    if (match.matches) { mqChange.call(match, breakpoint); }
  }

  function isActive(breakpoint) {
    return queries[breakpoint] && queries[breakpoint].matches;
  }

  function media(options, query) {
    // No matchMedia support
    if (!mMedia) {
      throw new Error('Media queries not supported.');
    }

    // Has matchMedia support
    if (typeof options === 'string') {
      bindMedia(options, query);
      return media;
    }

    if (typeof options === 'object') {
      Object.keys(options).forEach(function(breakpoint) {
        bindMedia(breakpoint, this[breakpoint]);
      }, options);
    }
    return media;
  }

  extend(media, pubsub);

  mqChange = function(breakpoint) {
    media.trigger(breakpoint + (this.matches ? ':enter' : ':exit'));
    media.trigger(breakpoint, this.matches);
  };

  media.is = isActive;
  media.getState = function(breakpoint) {
    if (breakpoint) { return isActive(breakpoint); }
    return Object.keys(queries).filter(isActive);
  };

  return media;
});

define('nbd/trait/responsive',['../util/media'], function(media) {
  'use strict';

  return {
    requestView: function me(ViewClass) {
      if (ViewClass == null && typeof this.constructor.VIEW_CLASS === 'object') {
        if (!this._isMediaBound) {
          this
          .listenTo(media, 'all', function(breakpoint, active) {
            if (active) {
              this.requestView(breakpoint);
            }
          })
          ._isMediaBound = true;
        }
        media.getState().some(function(state) {
          return this[state] && (ViewClass = state);
        }, this.constructor.VIEW_CLASS);
      }
      // Without super.requestView()
      var self = this, seen = false;
      do {
        self = Object.getPrototypeOf(self);
        seen = seen || self.requestView === me;
      }
      while(!(seen && self.requestView !== me));
      self.requestView.call(this, ViewClass);
    }
  };
});

define('nbd/Controller/Responsive',['./Entity', '../trait/responsive'], function(Controller, responsive) {
  'use strict';

  console.warn('nbd/Controller/Responsive is deprecated. Use nbd/Controller with nbd/trait/responsive');
  return Controller.extend().mixin(responsive);
});

define('nbd/trait/log',['../Logger'], function(Logger) {
  "use strict";
  var trait;

  try {
    trait = {
      get log() {
        if (!this._logger) {
          Object.defineProperty(this, '_logger', {
            value: Logger.get()
          });
        }
        this._logger.container = this;
        return this._logger;
      }
    };
  }
  catch(noGetter) {
    trait = {
      log: Logger.get()
    };
  }

  return trait;
});

define('nbd/trait/promise',['../Promise', '../util/extend'], function(Promise, extend) {
  'use strict';

  var promiseMe = function promise() {
    // Ensure there is a promise instance
    if (!this._promise) {
      Object.defineProperty(this, '_promise', {value: new Promise()});
    }
    return this._promise;
  };

  return extend(promiseMe, {
    then: function(onFulfilled, onRejected) {
      return promiseMe.call(this).then(onFulfilled, onRejected);
    },

    catch: function(onReject) {
      return promiseMe.call(this).catch(onReject);
    },

    finally: function(onAny) {
      return promiseMe.call(this).finally(onAny);
    },

    resolve: function(value) {
      promiseMe.call(this).resolve(value);
      return this;
    },

    reject: function(value) {
      promiseMe.call(this).reject(value);
      return this;
    },

    thenable: function() {
      return promiseMe.call(this).thenable();
    },

    promise: function() {
      return promiseMe.call(this).promise();
    }
  });
});

/*
 * Extraction of the deparam method from Ben Alman's jQuery BBQ
 * @see http://benalman.com/projects/jquery-bbq-plugin/
 */
define('nbd/util/deparam',[],function() {
  'use strict';

  return function (params, coerce) {
    var obj = {},
        coerce_types = { 'true': true, 'false': false, 'null': null };

    // Iterate over all name=value pairs.
    params.replace(/\+/g, ' ').split('&').forEach(function (v) {
      var param = v.split('='),
          key = decodeURIComponent(param[0]),
          val,
          cur = obj,
          i = 0,

          // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
          // into its component parts.
          keys = key.split(']['),
          keys_last = keys.length - 1;

      // If the first keys part contains [ and the last ends with ], then []
      // are correctly balanced.
      if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
        // Remove the trailing ] from the last keys part.
        keys[keys_last] = keys[keys_last].replace(/\]$/, '');

        // Split first keys part into two parts on the [ and add them back onto
        // the beginning of the keys array.
        keys = keys.shift().split('[').concat(keys);

        keys_last = keys.length - 1;
      } else {
        // Basic 'foo' style key.
        keys_last = 0;
      }

      // Are we dealing with a name=value pair, or just a name?
      if (param.length === 2) {
        val = decodeURIComponent(param[1]);

        // Coerce values.
        if (coerce) {
          val = val && !isNaN(val)              ? +val              // number
              : val === 'undefined'             ? undefined         // undefined
              : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
              : val;                                                // string
        }

        if (keys_last) {
          // Complex key, build deep object structure based on a few rules:
          // * The 'cur' pointer starts at the object top-level.
          // * [] = array push (n is set to array length), [n] = array if n is
          //   numeric, otherwise object.
          // * If at the last keys part, set the value.
          // * For each keys part, if the current level is undefined create an
          //   object or array based on the type of the next keys part.
          // * Move the 'cur' pointer to the next level.
          // * Rinse & repeat.
          for (i; i <= keys_last; i++) {
            key = keys[i] === '' ? cur.length : keys[i];
            cur = cur[key] = i < keys_last ?
              cur[key] || (keys[i+1] && isNaN(keys[i+1]) ? {} : []) :
              val;
          }

        } else {
          // Simple key, even simpler rules, since only scalars and shallow
          // arrays are allowed.

          if (Array.isArray(obj[key])) {
            // val is already an array, so push on the next value.
            obj[key].push(val);

          } else if (obj[key] !== undefined) {
            // val isn't an array, but since a second value has been specified,
            // convert val into an array.
            obj[key] = [obj[key], val];

          } else {
            // val is a scalar.
            obj[key] = val;
          }
        }

      } else if (key) {
        // No value was defined, so set something meaningful.
        obj[key] = coerce ? undefined : '';
      }
    });

    return obj;
  };
});

define('nbd/util/pipe',[],function() {
  'use strict';

  return function chain() {
    var chainArgs = arguments;
    return function() {
      var i, retval;
      for (i = 0; i < chainArgs.length; ++i) {
        retval = chainArgs[i].apply(this, i === 0 ? arguments : [retval]);
      }
      return retval;
    };
  };
});

define('nbd/util/throttle',[],function() {
  'use strict';

  return function throttle(fn) {
    if (fn._blocking) { return; }
    fn._blocking = true;

    var retval = fn.apply(this, Array.prototype.slice.call(arguments, 1));

    function unblock() { delete fn._blocking; }
    if (retval && typeof retval.then === 'function') {
      retval.then(unblock, unblock);
    }
    else {
      delete fn._blocking;
    }

    return retval;
  };
});

define('index',[
  'nbd/Class',
  'nbd/Model',
  'nbd/View',
  'nbd/View/Entity',
  'nbd/View/Element',
  'nbd/Controller',
  'nbd/Controller/Entity',
  'nbd/Controller/Responsive',
  'nbd/Promise',
  'nbd/Logger',
  'nbd/trait/log',
  'nbd/trait/promise',
  'nbd/trait/pubsub',
  'nbd/trait/responsive',
  'nbd/util/async',
  'nbd/util/construct',
  'nbd/util/curry',
  'nbd/util/deparam',
  'nbd/util/diff',
  'nbd/util/extend',
  'nbd/util/media',
  'nbd/util/pipe',
  'nbd/util/throttle'
], function(
  Class,
  Model,
  View,
  EntityView,
  ElementView,
  Controller,
  Entity,
  Responsive,
  Promise,
  Logger,
  log,
  promise,
  pubsub,
  responsive,
  async,
  construct,
  curry,
  deparam,
  diff,
  extend,
  media,
  pipe,
  throttle
) {
  'use strict';

  var exports = {
    Class: Class,
    Model: Model,
    View: View,
    Controller: Controller,
    Promise: Promise,
    Logger: Logger,
    trait: {
      log: log,
      promise: promise,
      pubsub: pubsub,
      responsive: responsive
    },
    util: {
      async: async,
      construct: construct,
      curry: curry,
      deparam: deparam,
      diff: diff,
      extend: extend,
      media: media,
      pipe: pipe,
      throttle: throttle
    }
  };

  exports.View.Element = ElementView;
  exports.View.Entity = EntityView;
  exports.Controller.Entity = Entity;
  exports.Controller.Responsive = Responsive;

  return exports;
});

return root.nbd = require('index'); })(this);
