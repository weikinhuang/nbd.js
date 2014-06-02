define(function() {
  'use strict';

  return function throttle(fn) {
    if (throttle._blocking) { return; }
    throttle._blocking = true;

    var retval = fn.apply(this, arguments);

    if (retval && typeof retval.then === 'function') {
      retval.then(function() {
        throttle._blocking = false;
      });
    }
    else {
      throttle._blocking = false;
    }

    return retval;
  };
});
