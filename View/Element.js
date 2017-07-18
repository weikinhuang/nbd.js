define(['../View'], function(View) {
  "use strict";

  var constructor = View.extend({
    $parent: null,

    init: function($parent) {
      this._super();
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

      return this.$view;
    }
  }, {
    displayName: 'View/Element'
  });

  return constructor;
});
