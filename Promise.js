/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['./util/async', './util/construct', './util/extend'], function(async, construct, extend) {
  'use strict';

  function PromiseResolver(promise) {
    var fulfills = [],
        rejects = [],
        state = 0,
        value;

    function call(fns, value) {
      if (fns.length) {
        async(function() {
          for (var i = 0; i < fns.length; ++i) { fns[i](value); }
          fulfills.length = rejects.length = 0;
        });
      }
    }

    function fulfill(x) {
      if (state) { return; }
      state = 1;
      value = x;
      call(fulfills, value);
    }

    function reject(reason) {
      if (state) { return; }
      state = -1;
      value = reason;
      call(rejects, value);
    }

    function resolve(x) {
      if (x === promise) {
        reject(new TypeError('Cannot resolve with self'));
      }

      // If handed another promise
      if (x instanceof Promise) {
        x.then(resolve, reject);
        return;
      }

      // If handed another then-able
      if ((typeof x === 'object' || typeof x === 'function') && x !== null) {
        var then, mutex = false;

        try {
          then = x.then;
        }
        catch (e) {
          reject(e);
          return;
        }

        if (typeof then === 'function') {
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
          return;
        }
      }

      fulfill(x);
    }

    promise.then = function then(onFulfill, onReject) {
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
        fulfills.push(typeof onFulfill === 'function' ?
                       wrap(onFulfill) :
                       next.resolve);

        rejects.push(typeof onReject === 'function' ?
                      wrap(onReject) :
                      next.reject);
      }
      // Promise fulfilled/rejected
      else {
        var toCall = ~state ? onFulfill : onReject;
        if (typeof toCall === 'function') {
          toCall = wrap(toCall);
          async(function() { toCall(value); });
        }
        else {
          next[~state ? 'resolve' : 'reject'](value);
        }
      }

      return next;
    };

    Object.defineProperties(this, {
      fulfill: { enumerable: true, value: fulfill },
      reject: { enumerable: true, value: reject },
      resolve: { enumerable: true, value: resolve }
    });
  }

  function Promise(callback) {
    if (!(this instanceof Promise)) {
      return new Promise(callback);
    }

    var resolver = new PromiseResolver(this);

    if (typeof callback === 'function') {
      try { callback(resolver); }
      catch(failure) {
        resolver.reject(failure);
      }
    }
    else {
      this.resolve = resolver.resolve;
      this.reject = resolver.reject;
    }
  }

  var forEach = Array.prototype.forEach;

  extend(Promise.prototype, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },

    finally: function(onAny) {
      return this.then(onAny, onAny);
    },

    done: function(onFulfill, onReject) {
      return this.then(onFulfill, onReject)
      .catch(function(reason) {
        async(function() {
          throw reason;
        });
      });
    },

    spread: function(onFulfill, onReject) {
      return this.then(function(arr) {
        onFulfill.apply(this, arr);
      }, onReject);
    },

    get: function(name) {
      return this.then(function(x) {
        return x[name];
      });
    },

    set: function(name, value) {
      return this.then(function(x) {
        x[name] = value;
        return x;
      });
    },

    delete: function(name) {
      return this.then(function(x) {
        delete x[name];
        return x;
      });
    },

    send: function(name) {
      var args = Array.prototype.slice.call(arguments, 1);
      return this.then(function(x) {
        return x[name].apply(x, args);
      });
    },

    fcall: function() {
      var args = arguments;
      return this.then(function(fn) {
        return fn.apply(undefined, args);
      });
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
    of: function(value) {
      return new this(function(resolver) {
        resolver.fulfill(value);
      });
    },

    from: function(value) {
      if (Promise.isPromise(value)) { return value; }
      return Promise.resolve(value);
    },

    resolve: function(value) {
      return new this(function(resolver) {
        resolver.resolve(value);
      });
    },

    reject: function(reason) {
      return new this(function(resolver) {
        resolver.reject(reason);
      });
    },

    race: function() {
      var r, p = new this(function(resolver) { r = resolver; });
      Array.prototype.map.call(arguments, function(value) {
        this.from(value).then(r.resolve, r.reject);
      }, this);
      return p;
    },

    every: function() {
      var r, p = new Promise(function(resolver) { r = resolver; }),
      results = [];

      function collect(index, retval) {
        results[index] = retval;
      }

      if (arguments.length) {
        results.map.call(arguments, function(value, i) {
          return Promise.from(value).then(collect.bind(null, i));
        })
        .reduce(Promise.join)
        .then(r.resolve.bind(null, results), r.reject);
      } else {
        r.resolve(results);
      }

      return p;
    },

    join: function(p1, p2) {
      return p1.then(function() { return p2; });
    },

    isPromise: function(x) {
      return x instanceof Promise;
    },

    isThenable: function(x) {
      if ((typeof x === 'object' || typeof x === 'function') && x !== null) {
        var then = x.then;
        return typeof then === 'function';
      }
      return false;
    }
  });

  return Promise;
});
