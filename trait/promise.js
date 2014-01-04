if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../Promise', '../util/extend'], function(Promise, extend) {
  'use strict';

  var promiseMe = function() {
    // Ensure there is a promise instance
    if (!this._promise) {
      Object.defineProperty(this, '_promise', {value: new Promise()});
    }
  };

  return {
    then: function(onFulfilled, onRejected) {
      promiseMe.call(this);
      return this._promise.then(onFulfilled, onRejected);
    },

    resolve: function(value) {
      promiseMe.call(this);
      this._promise.resolve(value);
      return this;
    },

    reject: function(value) {
      promiseMe.call(this);
      this._promise.reject(value);
      return this;
    },

    thenable: function() {
      promiseMe.call(this);
      return this._promise.thenable();
    },

    promise: function() {
      promiseMe.call(this);
      return this._promise.promise();
    }
  };
});
