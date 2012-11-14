/*global global */
require([
        'nbd/Class',
        'nbd/Model',
        'nbd/View',
        'nbd/Controller',
        'nbd/Events',
        'nbd/trait/pubsub',
        'nbd/trait/jquery.tmpl',
        'nbd/util/async',
        'nbd/util/pipe',
        'nbd/util/protochain',
        'nbd/util/jxon'
], function(Class, Model, View, Controller, Events, pubsub, jqtmpl, async, pipe, protochain, jxon) {
  'use strict';

  var exports = {
    Class : Class,
    Model : Model,
    View : View,
    Controller : Controller,
    Events : Events,
    trait : {
      pubsub : pubsub,
      jqtmpl : jqtmpl
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
