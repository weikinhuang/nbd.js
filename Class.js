if (typeof define !== 'function') { var define = require('amdefine')(module); }
/**
 * Behanced 
 * Built from Simple JS Inheritance by John 
 * Addons:
 * - Static properties 
 * - init() auto-calls super's init()
 * - can prevent auto-calling with stat.
 * - mixin() for implementing 
 */
/*global xyz */
define(function() {
  "use strict";

  var Klass, extend, mixin, inherits,
  fnTest = /xyz/.test(function(){return xyz;}) ? /\b_super\b/ : /.*/;

  function chainFn(parent, child) {
    return function() {
      parent.apply(this, arguments);
      return child.apply(this, arguments);
    };
  }

  // Create a new Class that inherits from this 
  extend = function(prop, stat) {
    var prototype, name, initfn, _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    prototype = Object.create(_super);

    function protochain(name, fn, initfn) {
      var applySuper = function() {return _super[name].apply(this,arguments);};
      return function() {
        var hadSuper = this.hasOwnProperty('_super'), tmp = this._super;
       
        // Add a new ._super() method that is the same 
        // but on the super-
        this._super = applySuper;

        // The method only need to be bound temporarily, so 
        // remove it when we're done 
        try {
          // Addon: calling up the init 
          if (initfn) { this._super.apply(this, arguments); }
       
          return fn.apply(this, arguments);
        }
        catch(e) {
          // Rethrow catch for IE 
          throw e;
        }
        finally {
          if (hadSuper) {this._super = tmp;}
        }
      };
    }

    // Copy the properties over onto the new 
    for (name in prop) {
      if ( prop.hasOwnProperty(name) ) {
        // Addon: check for need to call up the 
        initfn = name === "init" && !(stat && stat.hasOwnProperty("_") && stat._);

        // Check if we're overwriting an existing 
        prototype[name] = 
          typeof prop[name] === "function" &&
          typeof _super[name] === "function" && 
          (initfn || fnTest.test(prop[name])) ?
          protochain(name, prop[name], initfn) :
          prop[name];
      }
    }
   
    // The dummy class 
    function Class() {
      // All construction is actually done in the init 
      if ( typeof this.init === "function" ) {
        this.init.apply(this, arguments);
      }
    }

    // Addon: copy the superclass's stat 
    for (name in this) {
      if (this.hasOwnProperty(name)) {
        Class[name] = this[name];
      }
    }

    // Addon: override the provided stat 
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
   
    // Populate our constructed prototype 
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we 
    Object.defineProperty(Class.prototype, "constructor", {value:Class});

    // Class guaranteed 
    Object.defineProperties(Class, {
      extend: {value:extend, enumerable:false},
      mixin : {value:mixin},
      inherits: {value:inherits}
    });
   
    return Class;
  };

  // allows adding any object's properties into the 
  mixin = function(abstract) {
    var descriptor = {};
    Object.keys(abstract).forEach(function(prop) {
      descriptor[prop] = {
        configurable:false,
        value:abstract[prop]
      };
    });
    Object.defineProperties(this.prototype, descriptor);
    return this;
  };

  // determines if current class inherits from 
  inherits = function(superclass) {
    var prop, result = false;
    if (typeof superclass === 'function') {
      // Testing linear 
      return superclass.prototype.isPrototypeOf( this.prototype );
    }
    if (typeof superclass === 'object') {
      // Testing horizontal 
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
  Klass = function() {};
  Klass.extend = extend;

  return Klass;
});
