// Promise A+ test adapter
// For use with promises-aplus-tests

var Promise = require('../../Promise');

module.exports = {
	resolved: function(value) {
		return Promise.resolved(value);
	},

	rejected: function(reason) {
		return Promise.rejected(reason);
	},

	deferred: function() {
		var promise = new Promise();
		return {
			promise : promise,
			resolve : function(value) {
				promise.resolve(value);
			},
			reject : function(reason) {
				promise.reject(reason);
			}
		};
	}
};
