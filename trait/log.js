/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../Logger'], function(Logger) {
  "use strict";
  var trait;

  try {
    trait = {
      get log() {
        if (!this._logger) {
          Object.defineProperty(this, '_logger', {
            value: Logger.get()
          });
        }
        this._logger.container = this;
        return this._logger;
      }
    };
  }
  catch(noGetter) {
    trait = {
      log: Logger.get()
    };
  }

  return trait;
});
