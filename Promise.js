export default class NbdPromise extends Promise {
  constructor(callback) {
    let _promise;
    if (callback instanceof Promise) {
      _promise = callback;
    }
    else {
      _promise = typeof callback === 'function' ?
        new Promise(callback) :
        new Promise((resolve, reject) => {
          this.resolve = resolve;
          this.reject = reject;
        });
    }

    this.then = function(onFulfilled, onRejected) {
      return new this.constructor(_promise.then(onFulfilled, onRejected));
    };
    this.catch = function(onRejected) {
      return new this.constructor(_promise.catch(onRejected));
    };
  }

  finally(onAny) {
    return this.then(onAny, onAny);
  }

  done(onFulfill, onReject) {
    return this.then(onFulfill, onReject)
    // Escape the promise chain
    .catch(reason => setTimeout(function() {
      throw reason;
    }, 0));
  }

  /**
   * @deprecated by ES6 spread
   */
  spread(onFulfill, onReject) {
    return this.then(function(arr) {
      return onFulfill.apply(this, arr);
    }, onReject);
  }

  get(name) {
    return this.then(x => x[name]);
  }

  set(name, value) {
    return this.then(x => (x[name] = value, x));
  }

  delete(name) {
    return this.then(x => (delete x[name], x));
  }

  send(name, ...args) {
    return this.then(x => x[name].apply(x, args));
  }

  /**
   * @deprecated by ES6 spread
   */
  fcall(...args) {
    return this.then(fn => fn(...args));
  }

  thenable() {
    return { then: this.then };
  }

  // jQuery compatibility
  promise() {
    const self = this;
    const api = {
      done(...fns) {
        for (let fn of fns) {
          self.then(fn);
        }
        return api;
      },
      fail(...fns) {
        for (let fn of fns) {
          self.catch(fn);
        }
        return api;
      },
      always(...fns) {
        for (let fn of fns) {
          self.then(fn, fn);
        }
        return api;
      },
      progress() { return api; },
      promise() { return api; },
      then: this.then
    };

    return api;
  }

  // Promise wrappers
  static all(iterable) {
    return new this(super.all(iterable));
  }

  static race(iterable) {
    return new this(super.race(iterable));
  }

  static resolve(value) {
    return new this(super.resolve(value));
  }

  static reject(value) {
    return new this(super.reject(value));
  }

  // Extensions
  static from(value) {
    if (value instanceof this) { return value; }
    return this.resolve(value);
  }

  static isThenable(x) {
    if ((typeof x === 'object' || typeof x === 'function') && x !== null) {
      const then = x.then;
      return typeof then === 'function';
    }
    return false;
  }
}
