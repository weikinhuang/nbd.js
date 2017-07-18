define(function() {
  'use strict';

  return function throttle(fn) {
    if (fn._blocking) { return; }
    fn._blocking = true;

    var retval = fn.apply(this, Array.prototype.slice.call(arguments, 1));

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
