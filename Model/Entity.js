define(['nbd/Model', 'nbd/util/pipe', 'jquery'], function(Model, pipe, $) {
  'use strict';

  var constructor = Model.extend({

    update: function( options ) {

      var type = this.constructor.AJAX_TYPE.UPDATE || this.constructor.AJAX_TYPE;

      options = $.extend({
        url: this.constructor.URL_UPDATE,
        type: type,
        data: this.data()
      }, options);

      return $.ajax(options).then(
        pipe(this.updateFilter, Model.set.bind(Model))
      );

    },

    updateFilter: function(response) {
      return response;
    }

  }, {

    create: function( data ) {

      return $.ajax({
        url: this.URL_CREATE,
        type: 'POST',
        data: data
      });

    }, // create

    AJAX_TYPE : 'POST'

  });

  return constructor;
});
