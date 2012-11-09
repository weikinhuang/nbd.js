define(['nbd/Controller/Dialog', 'nbd/View/Dialog/Simple'], function( Dialog, SimpleView ) {
  "use strict";

  var exports = Dialog.extend({
  }, {
    VIEW_CLASS : SimpleView
  });

  return exports;
});
