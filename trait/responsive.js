/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../util/media'], function(media) {
  'use strict';

  return {
    requestView: function me(ViewClass) {
      if (ViewClass == null && typeof this.constructor.VIEW_CLASS === 'object') {
        if (!this._isMediaBound) {
          this
          .listenTo(media, 'all', function(breakpoint, active) {
            if (active) {
              this.requestView(breakpoint);
            }
          })
          ._isMediaBound = true;
        }
        media.getState().some(function(state) {
          return this[state] && (ViewClass = state);
        }, this.constructor.VIEW_CLASS);
      }
      // Without super.requestView()
      var self = this, seen = false;
      do {
        self = Object.getPrototypeOf(self);
        seen = seen || self.requestView === me;
      }
      while(!(seen && self.requestView !== me));
      self.requestView.call(this, ViewClass);
    }
  };
});
