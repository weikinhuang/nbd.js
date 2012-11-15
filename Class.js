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
define(function() {
  "use strict";

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
