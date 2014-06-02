// Promise A+ test adapter
// For use with promises-aplus-tests

var Promise = require('../../Promise');

module.exports = {
	resolved: function(value) {
		return Promise.of(value);
	},

	rejected: function(reason) {
		return Promise.reject(reason);
	},

	deferred: function() {
		var deferred,
        promise = new Promise(function(resolver) {
          deferred = resolver;
        });
        deferred.promise = promise;
        return deferred;
	}
};
