if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(function() {
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
