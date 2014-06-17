/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  '../util/construct',
  '../Controller',
  '../View/Entity',
  '../Model',
  '../trait/pubsub'
], function(construct, Controller, View, Model, pubsub) {
  'use strict';

  var constructor = Controller.extend({
    init: function() {
      this._model = construct.apply(this.constructor.MODEL_CLASS, arguments);
      this.requestView(this.constructor.VIEW_CLASS);
    },

    render: function($parent, ViewClass) {
      ViewClass = ViewClass || this.constructor.VIEW_CLASS;

      this.requestView(ViewClass);
      this._view.render($parent);
    },

    destroy: function() {
      this._view.destroy();
      this._model.destroy();
      this._model = this._view = null;
      this.trigger('destroy').stopListening().off();
    },

    requestView: function(ViewClass) {
      if (this._view instanceof ViewClass) { return; }
      this.switchView(ViewClass, this._model);
    },

    toJSON: function() {
      return this._model.toJSON();
    }
  }, {
    displayName: 'Controller/Entity',
    // Corresponding Entity View class
    VIEW_CLASS: View,

    // Corresponding Entity Model class
    MODEL_CLASS: Model
  })
  .mixin(pubsub);

  return constructor;
});
