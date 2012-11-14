/*global global */
require([
        'nbd/Class',
        'nbd/Model',
        'nbd/View',
        'nbd/Controller',
        'nbd/Events',
        'nbd/trait/pubsub',
        'nbd/util/async',
        'nbd/util/pipe',
        'nbd/util/protochain',
        'nbd/util/jxon'
], function(Class, Model, View, Controller, Events, pubsub, async, pipe, protochain, jxon) {
  'use strict';

  var exports = {
    Class : Class,
    Model : Model,
    View : View,
    Controller : Controller,
    Events : Events,
    trait : {
      pubsub : pubsub
    },
    util : {
      async : async,
      pipe : pipe,
      protochain : protochain,
      jxon : jxon
    }
  };

  global.nbd = exports;
});
