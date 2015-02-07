/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './Class',
  './trait/pubsub'
], function(Class, pubsub) {
  "use strict";

  var constructor = Class.extend({
    init: function(model) {
      this._model = model;

      if (model && typeof model.id === 'function') {
        this.id = function() {
          return model.id && model.id();
        };
      }

      this.on({
        prerender: function() {
          if (typeof this.prerender === 'function') {
            this.prerender();
          }
        },
        postrender: function($view) {
          // Back-compat for view.rendered()
          if (typeof this.rendered === 'function') {
            this.rendered($view);
          }
          if (typeof this.postrender === 'function') {
            this.postrender($view);
          }
        }
      });
    },

    destroy: function() {
      this.constructor.remove(this.$view);
      this.$view = null;
      this.off().stopListening();
    },

    template: function() {},

    // All data needed to template the view
    templateData: function() {
      return (this._model && this._model.data) ? this._model.data() : this._model;
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
      }

      return this.$view;
    }
  }, {
    displayName: 'View',
    domify: function(html) {
      var container;
      if (typeof html === 'string') {
        container = document.createElement('div');
        container.innerHTML = html;
        return container.removeChild(container.childNodes[0]);
      }

      return html;
    },

    appendTo: function($child, $parent) {
      if (!($child && $parent)) { return; }
      if ($child.appendTo) {
        return $child.appendTo($parent);
      }
      return ($parent.append || $parent.appendChild).call($parent, $child);
    },

    find: function($root, selector) {
      if (!$root) { return; }
      return ($root.find || $root.querySelector).call($root, selector);
    },

    replace: function($old, $new) {
      if (!$old) { return; }
      if ($old.replaceWith) {
        return $old.replaceWith($new);
      }
      return $old.parentNode &&
        $old.parentNode.replaceChild($new, $old);
    },

    remove: function($el) {
      if (!$el) { return; }
      if ($el.remove) {
        return $el.remove();
      }
      return $el.parentNode &&
        $el.parentNode.removeChild($el);
    }
  })
  .mixin(pubsub);

  return constructor;
});
