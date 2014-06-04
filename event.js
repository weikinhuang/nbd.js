/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './util/extend',
  './trait/pubsub'
], function(extend, pubsub) {
  'use strict';

  /**
   * @deprecated
   */
  var exports = extend({}, pubsub);

  // Aliases
  exports.bind = exports.on;
  exports.unbind = exports.off;
  exports.fire = exports.trigger;

  return exports;
});
