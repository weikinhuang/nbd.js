/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../View'], function(View) {
  'use strict';

  console.warn('nbd/View/Entity is deprecated. Use nbd/View');
  return View.extend();
});
