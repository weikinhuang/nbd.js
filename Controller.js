/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './util/construct',
  './Class',
  './View',
  './Model',
  './Promise',
  './trait/pubsub'
], function(construct, Class, View, Model, Promise, pubsub) {
  'use strict';

  var constructor = Class.extend({
    init: function() {
      this._initModel.apply(this, arguments);
      this.requestView();
    },

    render: function($parent, ViewClass) {
      this.requestView(ViewClass);
      return new Promise(function(resolve) {
        resolve(this._view.render($parent));
      }.bind(this));
    },

    destroy: function() {
      if (this._view) { this._view.destroy(); }
      this._model.destroy();
      this._model = this._view = null;
      this.trigger('destroy').stopListening().off();
    },

    _initModel: function() {
      var ModelClass = this.Model || this.constructor.MODEL_CLASS;
      this._model = construct.apply(ModelClass, arguments);
    },

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

      if (existing.destroy) {
        existing.destroy();
      }
    },

    requestView: function(ViewClass) {
      ViewClass = ViewClass || this.View || this.constructor.VIEW_CLASS;

      if (typeof ViewClass === 'string') {
        ViewClass = this.constructor.VIEW_CLASS[ViewClass];
      }
      if (typeof ViewClass !== 'function' || this._view instanceof ViewClass) {
        return;
      }
      this.switchView(ViewClass, this._model);
    },

    toJSON: function() {
      return this._model.toJSON();
    }
  }, {
    displayName: 'Controller',
    // Corresponding Entity View class
    VIEW_CLASS: View,

    // Corresponding Entity Model class
    MODEL_CLASS: Model
  })
  .mixin(pubsub);

  return constructor;
});
