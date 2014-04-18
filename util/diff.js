/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['./extend'], function(extend) {
  'use strict';

  var stack = [];

  function isObject(obj) {
    var proto;
    return obj && typeof obj === "object" &&
      (proto = Object.getPrototypeOf(obj),
       proto === Object.prototype ||
       proto === Array.prototype);
  }

  function objectCheck(cur, prev) {
    var key, equal = true;

    // If not objects, assume different
    if (!(isObject(cur) && isObject(prev))) { return false; }

    for (key in cur) {
      if (cur[key] === prev[key]) { continue; }

      if (isObject(cur[key]) && cur[key] && isObject(prev[key]) && prev[key]) {
        // Property has been visited, skip
        if (~stack.indexOf(cur[key])) { continue; }

        try {
          stack.push(cur[key]);

          // Recurse into object to find diff
          equal = equal && objectCheck(cur[key], prev[key]);
        }
        catch (emptyArgs) {}
        finally {
          stack.pop();
        }
      } else { equal = false; }

      if (!equal) { return equal; }
    }

    return equal;
  }

  return function diff(cur, prev, callback) {
    var key, lhs, rhs, differences = {};

    if (!(isObject(cur) && isObject(prev))) {
      throw new TypeError('Arguments must be objects');
    }

    // Make a copy of prev for its keys
    prev = extend({}, prev);

    for (key in cur) {
      if (cur.hasOwnProperty(key)) {
        lhs = cur[key];
        rhs = prev[key];
        delete prev[key];

        if (lhs === rhs) { continue; }

        // if either is not a simple object OR objectCheck fails then mark
        if (!(
          typeof lhs === "object" && typeof rhs === "object" &&
          lhs && rhs &&
          objectCheck(lhs, rhs)
       )) {
          differences[key] = [lhs, rhs];
          if (callback) {
            callback.call(this, key, lhs, rhs);
          }
        }
      }
    }

    // Any remaining keys are only in the prev
    for (key in prev) {
      if (prev.hasOwnProperty(key) && prev[key] !== undefined) {
        differences[key] = [cur[key], prev[key]];
        if (callback) {
          callback.call(this, key, undefined, prev[key]);
        }
      }
    }

    return differences;
  };
});
