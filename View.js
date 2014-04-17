/* istanbul ignore if */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  './Class',
  './trait/pubsub'
], function(Class, pubsub) {
  "use strict";

  var constructor = Class.extend({
    $view: null,

    render: function(data) {
      var $existing = this.$view;

      this.trigger('prerender', $existing);

      this.$view = constructor.domify(this.template(data || this.templateData()));
      constructor.replace($existing, this.$view);

      this.trigger('postrender', this.$view);

      // Prefer the postrender event over this method
      if (this.rendered) {
        this.rendered(this.$view);
      }

      return this.$view;
    },

    template: function() {},
    templateData: function() { return {}; },

    destroy: function() {
      constructor.remove(this.$view);
      this.$view = null;
      this.off().stopListening();
    }
  }, {
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
