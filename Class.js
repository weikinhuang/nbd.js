import mixin from './util/mixin';

export default class Base {
  static with(...mixins) {
    const Intermediate = class extends this {};
    for (let one of mixins) {
      mixin(Intermediate.prototype, one);
      for (let symbol of Object.getOwnPropertySymbols(one)) {
        Intermediate.prototype[symbol] = one[symbol];
      }
    }
    return Intermediate;
  }

  // Backward compatibility API
  static extend(proto, stat) {
    // replace proto methods with the chain-calling wrapper
    const klass = this;
    const _super = this.prototype;
    const fnTest = /xyz/.test(function() {/*global xyz*/ return xyz; }) ?
      /\b_super\b/ :
      /.*/;
    function protochain(name, fn) {
      var applySuper = name === 'init' ? function() {
        return (_super[name] || klass).apply(this, arguments);
      } : function() {
        return _super[name].apply(this, arguments);
      };

      return function() {
        var hadSuper = this.hasOwnProperty('_super'), tmp = this._super;

        // Add a new ._super() method that is the same method
        // but on the super-class
        this._super = applySuper;

        // The method only need to be bound temporarily, so we
        // remove it when we're done executing
        try {
          return fn.apply(this, arguments);
        }
        finally {
          if (hadSuper) {
            this._super = tmp;
          }
          else {
            delete this._super;
          }
        }
      };
    }
    for (let method of Object.keys(proto)) {
      if (typeof proto[method] === 'function' && fnTest.test(proto[method])) {
        proto[method] = protochain(method, proto[method]);
      }
    }

    let Subclass = this.with(proto);
    // merge static properties
    if (stat) {
      mixin(Subclass, stat);
    }

    // Need to proxy constructor to call .init()
    Subclass = new Proxy(Subclass, {
      construct(target, args) {
        // This is the safest without Reflect.construct()
        let ret, instance = Object.create(target.prototype);
        if (typeof instance.init === 'function') {
          ret = instance.init.apply(instance, args);
        }
        else {
          // Call the real super constructor
          ret = target.apply(instance, args);
        }
        return Object(ret) === ret ? ret : instance;
      },
      apply(target, context, args) {
        return this.construct(target, args);
      }
    });

    return Subclass;
  }

  static mixin(...mixins) {
    for (let one of mixins) {
      mixin(this.prototype, one);
    }
    return this;
  }
}
