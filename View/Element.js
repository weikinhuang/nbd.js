/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../View'], function(View) {
  "use strict";

  var constructor = View.extend({
    $parent: null,

    init: function($parent) {
      this.$parent = $parent;
    },

    render: function(data) {
      var $existing = this.$view;

      this.trigger('prerender', $existing);

      this.$view = this.constructor.domify(this.template(data || this.templateData()));

      if ($existing) {
        this.constructor.replace($existing, this.$view);
      }
      else {
        this.constructor.appendTo(this.$view, this.$parent);
      }

      this.trigger('postrender', this.$view);

      if (typeof this.rendered === 'function') {
        this.rendered(this.$view);
      }

      return this.$view;
    }
  });

  return constructor;
});
