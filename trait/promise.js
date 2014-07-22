/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../Promise', '../util/extend'], function(Promise, extend) {
  'use strict';

  var promiseMe = function promise() {
    // Ensure there is a promise instance
    if (!this._promise) {
      Object.defineProperty(this, '_promise', {value: new Promise()});
    }
    return this._promise;
  };

  return extend(promiseMe, {
    then: function(onFulfilled, onRejected) {
      return promiseMe.call(this).then(onFulfilled, onRejected);
    },

    catch: function(onReject) {
      return promiseMe.call(this).catch(onReject);
    },

    finally: function(onAny) {
      return promiseMe.call(this).finally(onAny);
    },

    resolve: function(value) {
      promiseMe.call(this).resolve(value);
      return this;
    },

    reject: function(value) {
      promiseMe.call(this).reject(value);
      return this;
    },

    thenable: function() {
      return promiseMe.call(this).thenable();
    },

    promise: function() {
      return promiseMe.call(this).promise();
    }
  });
});
