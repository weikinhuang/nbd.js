/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(function() {
  'use strict';

  return function throttle(fn) {
    if (fn._blocking) { return; }
    fn._blocking = true;

    var retval = fn.call(this);

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
