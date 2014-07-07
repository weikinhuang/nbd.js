/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './Class',
  './trait/pubsub',
  './util/construct',
  './util/extend'
], function(Class, pubsub, construct, extend) {
  'use strict';

  var _logHandlers = [],
  _levels = {
    debug: true,
    log:  true,
    info: true,
    warn: true,
    error: true
  },

  Logger = Class.extend({
    init: function(name) {
      if (typeof name === 'string') {
        this.name = name;
      }
      else {
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
      var local = this.container &&
        Object.getPrototypeOf(this.container).constructor;
      return this.name || local && (local.displayName || local.name);
    }
  }, {
    displayName: 'Logger',

    get: function(name) {
      var logger = construct.call(this, name);
      logger.attach(this.global);
      return logger;
    },

    attach: function(handler) {
      if (typeof handler === 'function') {
        _logHandlers.push(handler);
      }
    },

    setLevel: function splat(level, handler) {
      var key;
      if (typeof level === 'string') {
        _levels[level] = typeof handler === 'function' ? handler : !!handler;
      }
      else if (typeof level === 'object') {
        for (key in level) {
          splat(key, level[key]);
        }
      }
    },

    global: function(level, message) {
      var allowed = _levels[level];
      allowed = !!(typeof allowed === 'function' ? allowed(message) : allowed);
      return allowed && _logHandlers.forEach(function(handler) {
        handler(level, message);
      });
    },

    console: function(level, message) {
      var params = message.params;
      if (message.context) {
        params = ['%c' + message.context, 'color:gray'].concat(params);
      }
      return console[level] && console[level].apply(console, params);
    }
  })
  .mixin(pubsub);

  Logger.attach(Logger.console);

  return Logger;
});
