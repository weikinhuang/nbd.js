import Promise from '../Promise';
import extend from '../util/extend';

const privatePromise = Symbol('promise');
const privatePromiseResolve = Symbol('promiseResolve');
const privatePromiseReject = Symbol('promiseReject');

const promiseMe = function promiseMe() {
  // Ensure there is a promise instance
  if (!this[privatePromise]) {
    Object.defineProperty(this, privatePromise, {
      value: new Promise((resolve, reject) => {
        this[privatePromiseResolve] = resolve;
        this[privatePromiseReject] = reject;
      })
    });
  }
  return this[privatePromise];
};

export default extend(promiseMe, {
  then(onFulfilled, onRejected) {
    return promiseMe.call(this).then(onFulfilled, onRejected);
  },

  catch(onReject) {
    return promiseMe.call(this).catch(onReject);
  },

  finally(onAny) {
    return promiseMe.call(this).finally(onAny);
  },

  resolve(value) {
    promiseMe.call(this);
    this[privatePromiseResolve](value);
    return this;
  },

  reject(value) {
    promiseMe.call(this);
    this[privatePromiseReject](value);
    return this;
  },

  thenable() {
    return promiseMe.call(this).thenable();
  },

  promise() {
    return promiseMe.call(this).promise();
  }
});
