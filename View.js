import pubsub from './trait/pubsub';
import Base from './Class';

const fragment = document.createDocumentFragment();
const nests = 'nests';
export { nests };

function renderMatching(key) {
  if (!this.$view) { return; }
  var selector = this[nests][key],
    contained = this._model.get ? this._model.get(key) : this._model[key],
    $context = selector ? this.constructor.find(this.$view, selector) : this.$view;

  if (!$context) { return; }
  if (contained && contained.render) {
    contained.render($context);
  }
}

class View extends Base.with(pubsub) {
  constructor(model) {
    this._model = model;

    if (model && model.on) {
      this.listenTo(this._model, 'all', this._switchNested);
    }
    this.on({
      prerender(...args) {
        if (typeof this.prerender === 'function') {
          this.prerender(...args);
        }
      },
      postrender(...args) {
        if (typeof this.postrender === 'function') {
          this.postrender(...args);
        }
        // Backward compatibility
        if (typeof this.rendered === 'function') {
          this.rendered(...args);
        }
      }
    });
  }

  destroy() {
    this.constructor.remove(this.$view);
    this.$view = null;
    this.off().stopListening();
  }

  template() {}

  templateData() {
    return (this._model && this._model.data) ? this._model.data() : this._model;
  }

  render($parent) {
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

  _renderNested() {
    if (!this[nests]) { return; }
    Object.keys(this[nests]).forEach(renderMatching, this);
  }

  _switchNested(key, val, old) {
    if (this[nests] != null && key in this[nests]) {
      if (old && old.render) { old.render(fragment); }
      renderMatching.call(this, key);
    }
  }

  static domify(html) {
    var container;
    if (typeof html === 'string') {
      container = document.createElement('div');
      container.innerHTML = html;
      return container.removeChild(container.childNodes[0]);
    }

    return html;
  }

  static appendTo($child, $parent) {
    if (!($child && $parent)) { return; }
    if ($child.appendTo) {
      return $child.appendTo($parent);
    }
    return ($parent.append || $parent.appendChild).call($parent, $child);
  }

  static find($root, selector) {
    if (!$root) { return; }
    return ($root.find || $root.querySelector).call($root, selector);
  }

  static replace($old, $new) {
    if (!$old) { return; }
    if ($old.replaceWith) {
      return $old.replaceWith($new);
    }
    return $old.parentNode &&
      $old.parentNode.replaceChild($new, $old);
  }

  static remove($el) {
    if (!$el) { return; }
    if ($el.remove) {
      return $el.remove();
    }
    return $el.parentNode &&
      $el.parentNode.removeChild($el);
  }
}

export default View;
