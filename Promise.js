/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['./util/async', './util/construct', './util/extend'], function(async, construct, extend) {
  'use strict';

  function Promise(starting) {
    var self = this,
    onResolve = [],
    onReject = [],
    state = 0,
    value;

    function call(fns) {
      if (fns.length) {
        async(function() {
          for (var i = 0; i < fns.length; ++i) { fns[i](value); }
        });
      }
      // Reset callbacks
      onResolve = onReject = [];
    }

    function fulfill(x) {
      if (state) { return; }
      state = 1;
      value = x;
      call(onResolve);
    }

    function reject(reason) {
      if (state) { return; }
      state = -1;
      value = reason;
      call(onReject);
    }

    function resolve(x) {
      if (x === self) {
        reject(new TypeError('Cannot resolve with self'));
      }

      // If handed another promise
      if (x instanceof Promise) {
        x.then(resolve, reject);
        return;
      }

      // If handed another then-able
      if ((typeof x === 'object' || typeof x === 'function') && x !== null) {
        var then;

        try {
          then = x.then;
        }
        catch (e) {
          reject(e);
          return;
        }

        if (typeof then === 'function') {
          return (function thenAble() {
            var mutex = false;

            try {
              then.call(x, function resolvePromise(y) {
                if (mutex) { return; }
                (y === x ? fulfill : resolve)(y);
                mutex = true;
              }, function rejectPromise(r) {
                if (mutex) { return; }
                reject(r);
                mutex = true;
              });
            }
            catch (e) { if (!mutex) { reject(e); } }
          }());
        }
      }

      fulfill(x);
    }

    function then(onFulfilled, onRejected) {
      var next = new Promise();

      function wrap(fn) {
        return function(x) {
          var retval;
          try {
            retval = fn(x);
          }
          catch(e) {
            next.reject(e);
          }
          next.resolve(retval);
        };
      }

      // Promise pending
      if (!state) {
        onResolve.push(typeof onFulfilled === 'function' ?
                       wrap(onFulfilled) :
                       next.resolve);

        onReject.push(typeof onRejected === 'function' ?
                      wrap(onRejected) :
                      next.reject);
      }
      // Promise fulfilled/rejected
      else {
        var toCall = ~state ? onFulfilled : onRejected;
        if (typeof toCall === 'function') {
          toCall = wrap(toCall);
          async(function() { toCall(value); });
        }
        else {
          next[~state ? 'resolve' : 'reject'](value);
        }
      }

      return next;
    }

    Object.defineProperties(this, {
      reject: {value: reject},
      resolve: {value: resolve}
    });

    this.then = then;

    if (arguments.length) {
      resolve(starting);
    }
  }

  var forEach = Array.prototype.forEach;

  extend(Promise.prototype, {
    catch: function(onRejected) {
      return this.then(undefined, onRejected);
    },

    finally: function(onAny) {
      return this.then(onAny, onAny);
    },

    thenable: function() {
      return { then: this.then };
    },

    promise: function() {
      var then = this.then,
      retSelf = function() { return api; },
      api = {
        done: function() {
          forEach.call(arguments, function(fn) { then(fn); });
          return api;
        },
        fail: function() {
          forEach.call(arguments, function(fn) { then(undefined, fn); });
          return api;
        },
        always: function() {
          forEach.call(arguments, function(fn) { then(fn, fn); });
          return api;
        },
        then: then,
        progress: retSelf,
        promise: retSelf
      };

      return api;
    }
  });

  extend(Promise, {
    resolved: construct,
    rejected: function(reason) {
      var p = new this();
      p.reject(reason);
      return p;
    }
  });

  return Promise;
});
