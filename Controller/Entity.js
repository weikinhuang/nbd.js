/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../Controller'], function(Controller) {
  'use strict';

  console.warn('nbd/Controller/Entity is deprecated. Use nbd/Controller');
  return Controller.extend();
});
