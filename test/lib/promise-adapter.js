// Promise A+ test adapter
// For use with promises-aplus-tests

var Promise = require('../../Promise');

module.exports = {
	resolved: function(value) {
		return Promise.resolve(value);
	},

	rejected: function(reason) {
		return Promise.reject(reason);
	},

	deferred: function() {
		var deferred = {},
        promise = new Promise(function(resolve, reject) {
          deferred.resolve = resolve;
          deferred.reject = reject;
        });
        deferred.promise = promise;
        return deferred;
	}
};
