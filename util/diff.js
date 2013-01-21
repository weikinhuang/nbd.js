define(['nbd/util/extend'], function(extend) {
  'use strict';

  var stack = [];

  function objectCheck(cur, prev) {
    var key, equal=true;

    for (key in cur) {
      if (cur[key] !== prev[key]) {
        return false;
      }

      if (cur[key] && cur.hasOwnProperty(key) && typeof cur[key] === "object") {
        // Property has been visited, skip
        if (stack.indexOf(cur[key]) >= 0 ) { continue; }

        try {
          stack.push(cur[key]);

          // Recurse into object to find diff
          equal = equal && objectCheck(prev[key], cur[key]);
        }
        catch (emptyArgs) {}
        finally {
          stack.pop();
        }
      }

      if (!equal) { return equal; }
    }

    return equal;
  }

  return function diff(cur, prev, callback) {
    var key, difference, differences = {};

    if (typeof prev !== "object" || typeof cur !== "object" ||
        prev === null || cur === null) {
      throw new TypeError('Arguments must be ojects');
    }

    // Make a copy of prev for its keys
    prev = extend({},prev);

    for (key in cur) {
      if (cur.hasOwnProperty(key)) {
        if (prev[key] !== cur[key] ||
            (typeof cur[key] === "object" && 
             cur[key] && 
             !objectCheck(cur[key], prev[key])
            )
           ) 
        {
          differences[key] = [cur[key], prev[key]];
          if (callback) {
            callback.apply(this, [key, cur[key], prev[key]]);
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
