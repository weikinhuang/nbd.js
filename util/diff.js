define(['nbd/util/extend'], function(extend) {
  'use strict';

  var stack = [];

  return function diff(cur, prev, callback, deep) {
    var key, difference, differences = {};

    if (typeof prev !== "object" || typeof cur !== "object" ||
        prev === null || cur === null) {
      throw new TypeError('Arguments must be ojects');
    }

    // Make a copy of prev for its keys
    prev = extend({},prev);

    for (key in cur) {
      if (cur.hasOwnProperty(key)) {
        // Property has been visited, skip
        if (stack.inArray(cur[key]) >= 0 ) { continue; }

        if (prev[key] !== cur[key]) {
          differences[key] = [cur[key], prev[key]];
          if (callback) {
            callback.apply(this, [key, cur[key], prev[key]]);
          }
        }
        else if (deep && typeof cur[key] === "object" && cur[key]) {
          try {
            // Recurse into object to find diff
            stack.push(cur[key]);
            diff.call(this, prev[key], cur[key], callback);
          }
          catch (emptyArgs) {}
          finally {
            stack.pop();
          }
        }
        delete prev[key];
      }
    }

    // Any remaining keys are only in the prev
    for (key in prev) {
      if (prev.hasOwnProperty(key)) {
        differences[key] = [cur[key]];
        if (callback) {
          callback.apply(this, [key, undefined, prev[key]]);
        }
      }
    }
    
    return differences;
  };
});
