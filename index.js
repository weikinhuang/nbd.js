if (typeof define !== 'function') { var define = require('amdefine')(module); }

define([
  './Class',
  './Model',
  './View',
  './View/Entity',
  './View/Element',
  './Controller',
  './Controller/Entity',
  './Controller/Responsive',
  './Promise',
  './Logger',
  './trait/log',
  './trait/promise',
  './trait/pubsub',
  './util/async',
  './util/construct',
  './util/curry',
  './util/deparam',
  './util/diff',
  './util/extend',
  './util/media',
  './util/pipe'
], function(
  Class,
  Model,
  View,
  EntityView,
  ElementView,
  Controller,
  Entity,
  Responsive,
  Promise,
  Logger,
  log,
  promise,
  pubsub,
  async,
  construct,
  curry,
  deparam,
  diff,
  extend,
  media,
  pipe
) {
  'use strict';

  var exports = {
    Class: Class,
    Model: Model,
    View: View,
    Controller: Controller,
    Promise: Promise,
    Logger: Logger,
    trait: {
      log: log,
      promise: promise,
      pubsub: pubsub
    },
    util: {
      async: async,
      construct: construct,
      curry: curry,
      deparam: deparam,
      diff: diff,
      extend: extend,
      media: media,
      pipe: pipe
    }
  };

  exports.View.Element = ElementView;
  exports.View.Entity = EntityView;
  exports.Controller.Entity = Entity;
  exports.Controller.Responsive = Responsive;

  return exports;
});
