/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './Entity',
  '../util/media'
], function(Entity, media) {
  'use strict';

  var constructor = Entity.extend({
    init: function() {
      this._super.apply(this, arguments);
      media.on('all', this.mediaView, this);
    },

    destroy: function() {
      media.off(null, null, this);
      if (this._view) {
        this._view.destroy();
      }
      this._model.destroy();
    },

    render: function() {
      return this._view && this._view.render.apply(this._view, arguments);
    },

    requestView: function(ViewClass) {
      if (typeof ViewClass !== 'function') {
        ViewClass = media.getState().map(function(state) {
          return this && this[state];
        }, ViewClass)
        .filter(Boolean)[0];
      }
      if (typeof ViewClass === 'function' &&
          !(this._view instanceof ViewClass)) {
        this.switchView(ViewClass, this._model);
      }
    },

    mediaView: function(breakpoint, active) {
      var ViewClass = this.constructor.VIEW_CLASS;
      if (typeof ViewClass !== 'function') {
        ViewClass = ViewClass[breakpoint];
        if (typeof ViewClass === 'function' && active) {
          this.requestView(ViewClass);
        }
      }
    }
  }, {
    displayName: 'Controller/Responsive'
  });

  return constructor;
});
