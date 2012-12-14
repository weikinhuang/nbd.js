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
        'nbd/util/diff',
		'nbd/util/extend',
        'nbd/util/media',
        'nbd/util/pipe',
        'nbd/util/protochain'
], function(Class, Model, View, Controller, events, pubsub, jqtmpl, async, diff, extend, media, pipe, protochain) {
  'use strict';

  var exports = {
    Class : Class,
    Model : Model,
    View : View,
    Controller : Controller,
    Events : events,
    trait : {
      pubsub : pubsub,
      'jquery.tmpl' : jqtmpl
    },
    util : {
      async : async,
      diff : diff,
	  extend : extend,
      media : media,
      pipe : pipe,
      protochain : protochain
    }
  };

  global.nbd = exports;
});
