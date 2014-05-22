/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(['../View'], function(View) {
  "use strict";

  var constructor = View.extend({
    init: function(model) {
      if (typeof model === 'object') {
        this._model = model;
      }

      this.id = (model && model.id) || function() {
        return model;
      };
    },

    destroy: function(persist) {
      if (!persist) {
        this._model = null;
      }
      this._super();
    },

    // All data needed to template the view
    templateData: function() {
      return (this._model && this._model.data) ? this._model.data() : this.id();
    },

    render: function($parent) {
      var $existing = this.$view,
          fresh = !($existing && $parent);

      if (fresh) {
        this.trigger('prerender', $existing);
        this.$view = this.constructor.domify(this.template(this.templateData()));
      }

      if ($parent) {
        this.constructor.appendTo(this.$view, $parent);
      }
      else {
        this.constructor.replace($existing, this.$view);
      }

      if (fresh) {
        this.trigger('postrender', this.$view);

        if (typeof this.rendered === 'function') {
          this.rendered(this.$view);
        }
      }

      return this.$view;
    }
  }, {
    displayName: 'View/Entity'
  });

  return constructor;
});
