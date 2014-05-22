/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './Class',
  './util/construct'
],  function(Class, construct) {
  "use strict";

  var constructor = Class.extend({
    destroy: function() {},

    _initView: function() {
      var ViewClass = Array.prototype.shift.call(arguments);
      this._view = construct.apply(ViewClass, arguments);
      this._view._controller = this;
    },

    switchView: function() {
      var existing = this._view;
      this._initView.apply(this, arguments);

      if (!existing) { return; }

      if (existing.$view) {
        this._view.$view = existing.$view;
        this._view.render();
      }

      existing.destroy();
    }
  }, {
    displayName: 'Controller'
  });

  return constructor;
});
