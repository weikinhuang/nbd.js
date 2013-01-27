/*global global */
define(['nbd/Class',
       'nbd/Model',
       'nbd/View',
       'nbd/View/Entity',
       'nbd/View/Element',
       'nbd/Controller',
       'nbd/Controller/Entity',
       'nbd/event',
       'nbd/trait/pubsub',
       'nbd/trait/jquery.tmpl',
       'nbd/util/async',
       'nbd/util/construct',
       'nbd/util/deparam',
       'nbd/util/diff',
       'nbd/util/extend',
       'nbd/util/media',
       'nbd/util/pipe',
       'nbd/util/protochain'
], function(Class, Model, View, EntityView, ElementView, Controller, Entity, event, pubsub, jqtmpl, async, construct, deparam, diff, extend, media, pipe, protochain) {
  'use strict';

  var exports = {
    Class : Class,
    Model : Model,
    View : View,
    Controller : Controller,
    event : event,
    trait : {
      pubsub : pubsub,
      'jquery.tmpl' : jqtmpl
    },
    util : {
      async : async,
      construct : construct,
      deparam : deparam,
      diff : diff,
      extend : extend,
      media : media,
      pipe : pipe,
      protochain : protochain
    }
  };

  exports.View.Element = ElementView;
  exports.View.Entity = EntityView;
  exports.Controller.Entity = Entity;

  global.nbd = exports;
  return exports;
});
