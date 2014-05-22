/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './Class',
  './trait/pubsub',
  './util/construct',
  './util/extend'
], function(Class, pubsub, construct, extend) {
  "use strict";

  var _logHandlers = [],

  Logger = Class.extend({
    init: function(name) {
      if (typeof name === 'string') {
        this.name = name;
      }
      else if (name) {
        this.container = name;
      }

      this.levels.forEach(function(level) {
        this[level] = this._log.bind(this, level);
      }, this);

      Object.defineProperty(this, 'level', {
        writable: true,
        value: 0
      });

      if (!this.hasOwnProperty('log')) {
        this.log = this[this.levels[0]];
      }
    },

    destroy: function() {
      this.off();
      this.container = null;
    },

    levels: ['debug', 'log', 'info', 'warn', 'error'],

    setLevel: function(level) {
      var i;
      if (~(i = this.levels.indexOf(level))) {
        this.level = i;
      }
    },

    attach: function(route) {
      this.on('all', route);
    },

    remove: function(route) {
      this.off(null, route);
    },

    _log: function(level) {
      var i, params;

      if ((i = this.levels.indexOf(level)) < this.level) { return; }

      params = Array.prototype.slice.call(arguments, 1);
      this.trigger(this.levels[i], {
        context: this._name(),
        params: params
      });
    },

    _name: function() {
      var local = this.container && Object.getPrototypeOf(this.container).constructor;
      return this.name || local && (local.displayName || local.name);
    }
  }, {
    displayName: 'Logger',

    get: function(name) {
      var logger = construct.call(this, name);
      logger.attach(this.global);
      this.attach(this.console);
      return logger;
    },

    attach: function(handler) {
      if (typeof handler === 'function') {
        _logHandlers.push(handler);
      }
    },

    global: function(level, message) {
      _logHandlers.forEach(function(handler) {
        handler(level, message);
      });
    },

    console: function(level, message) {
      if (message.context) {
        message.params.unshift('%c' + message.context, 'color:gray');
      }
      console[level].apply(console, message.params);
    }
  })
  .mixin(pubsub);

  return Logger;
});
