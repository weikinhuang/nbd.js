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
