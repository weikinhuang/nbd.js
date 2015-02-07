/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(function() {
  'use strict';

  return function mixin(target, abstract) {
    var descriptor = {};
    Object.keys(abstract).forEach(function(prop) {
      descriptor[prop] = Object.getOwnPropertyDescriptor(abstract, prop);
    });
    Object.defineProperties(target, descriptor);
  };
});
