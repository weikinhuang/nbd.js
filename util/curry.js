if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(function() {
  'use strict';

  return function curry(fn) {
    return function() {
      var rest = arguments;
      return function() {
        Array.prototype.unshift.apply(arguments, rest);
        return fn.apply(this, arguments);
      };
    };
  };
});
