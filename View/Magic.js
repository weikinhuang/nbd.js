import View from '../View';
import extend from '../util/extend';
import sax from 'sax';
import vdom from 'virtual-dom';

const _parser = sax.parser();
const tagstack = new Proxy([], {
  get(target, name) {
    if (+name < 0) {
      return target[+name + target.length];
    }
    return target[name];
  }
});

let tree;

function isAttribute(name) {
  return [
    /^data-[\w-]+$/i
  ].some(re => re.test(name));
}

function transformAttributes(properties) {
  properties.attributes = {};
  for (let prop in properties) {
    if (properties.hasOwnProperty(prop)) {
      if (prop.toLowerCase() === 'class') {
        properties.className = properties[prop];
        delete properties[prop];
      }
      if (isAttribute(prop)) {
        properties.attributes[prop] = properties[prop];
        delete properties[prop];
      }
    }
  }
}

extend(_parser, {
  onopentag({ name, attributes }) {
    transformAttributes(attributes);
    const tag = { name, attributes, children: [] };
    if (tagstack[-1]) {
      tagstack[-1].children.push(tag);
    }
    tagstack.push(tag);
  },
  onclosetag() {
    const tag = tagstack.pop();
    let vnode = vdom.h(tag.name, tag.attributes, tag.children);
    const last = tagstack[-1];
    if (last) {
      last.children.splice(last.children.lastIndexOf(tag), 1, vnode);
    }
    else {
      tree = vnode;
    }
  },
  ontext(text) {
    tagstack[-1].children.push(text);
  },
  onend() {
    tagstack.length = 0;
  }
});

export default class Magic extends View {
  constructor(...args) {
    super(...args);
    this.listenTo(this._model, 'all', () => this.render());
  }

  static domify(html) {
    tree = null;
    _parser.write(html).close();
    return tree;
  }

  static appendTo(tree, $context) {
    return super.appendTo(this._el = vdom.create(tree), $context);
  }

  static replace(oldtree, newtree) {
    const patch = vdom.diff(oldtree, newtree);
    vdom.patch(this._el, patch);
  }

  static find($root, selector) {
    if (this._el) {
      return super.find(this._el, selector);
    }
    return super.find($root, selector);
  }

  static remove($el) {
    if (this._el) {
      return super.remove(this._el);
    }
    return super.remove($el);
  }
}
