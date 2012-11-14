/*jslint evil:true */
require([
        'nbd/Class',
        'nbd/Model',
        'nbd/View',
        'nbd/Controller',
        'nbd/Events',
        'nbd/trait/pubsub',
        'nbd/util/async',
        'nbd/util/pipe',
        'nbd/util/jxon'
], function(Class, Model, View, Controller, pubsub, async, pipe, jxon) {
  'use strict';

  /**
   * @see http://stackoverflow.com/questions/3277182/how-to-get-the-global-object-in-javascript 
   */
  var global = (new Function('return this'))(),

  exports = {
    Class : Class,
    Model : Model,
    View : View,
    Controller : Controller,
    traits : {
      pubsub : pubsub
    },
    utils : {
      async : async,
      pipe : pipe,
      jxon : jxon
    }
  };

  global.nbd = exports;

});
