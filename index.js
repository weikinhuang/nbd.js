define([
  'nbd/Class',
  'nbd/Model',
  'nbd/View',
  'nbd/View/Entity',
  'nbd/View/Element',
  'nbd/Controller',
  'nbd/Controller/Entity',
  'nbd/Controller/Responsive',
  'nbd/Promise',
  'nbd/Logger',
  'nbd/trait/log',
  'nbd/trait/promise',
  'nbd/trait/pubsub',
  'nbd/trait/responsive',
  'nbd/util/async',
  'nbd/util/construct',
  'nbd/util/curry',
  'nbd/util/deparam',
  'nbd/util/diff',
  'nbd/util/extend',
  'nbd/util/media',
  'nbd/util/pipe',
  'nbd/util/throttle'
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
  responsive,
  async,
  construct,
  curry,
  deparam,
  diff,
  extend,
  media,
  pipe,
  throttle
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
      pubsub: pubsub,
      responsive: responsive
    },
    util: {
      async: async,
      construct: construct,
      curry: curry,
      deparam: deparam,
      diff: diff,
      extend: extend,
      media: media,
      pipe: pipe,
      throttle: throttle
    }
  };

  exports.View.Element = ElementView;
  exports.View.Entity = EntityView;
  exports.Controller.Entity = Entity;
  exports.Controller.Responsive = Responsive;

  return exports;
});
