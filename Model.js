import Base from './Class';
import async from './util/async';
import diff from './util/diff';
import extend from './util/extend';
import pubsub from './trait/pubsub';

function copy(a) {
  if (a != null && typeof a === 'object') {
    return Array.isArray(a) ? Array.prototype.slice.call(a) :
      a.constructor === Object ? extend({}, a) :
      a;
  }
  return a;
}

function isNumeric(n) {
  return !(isNaN(n) || n !== 0 && !n);
}

const dirtyCheck = function(old, novel) {
  this._dirty = 0;
  diff.call(this, novel || this._data, old, this.trigger);
};

export default class Model extends Base.with(pubsub) {
  constructor(id, data) {
    if (isNumeric(id)) {
      id = +id;
    }

    if (data === undefined && typeof id === 'object') {
      data = id;
      id = undefined;
    }

    this.get = this.get.bind(this);
    this.set = this.set.bind(this);

    Object.defineProperties(this, {
      _id: {
        value: id
      },
      _dirty: {
        value: 0,
        writable: true
      },
      _data: {
        enumerable: false,
        configurable: true,
        value: extend(Object.create(this.default || null), data),
        writable: true
      }
    });
  }

  destroy() {
    this.off();
    async.clearImmediate(this._dirty);
    this._data = null;
  }

  get id() {
    return this._id;
  }

  data() {
    var orig = this._data, clone;

    if (!this._dirty) {
      clone = Object.keys(orig).reduce(function(obj, key) {
        return obj[key] = copy(orig[key]), obj;
      }, {});
      this._dirty = async(dirtyCheck.bind(this, clone));
    }
    return this._data;
  }

  get(prop) {
    var value = this._data[prop];
    // If getting an array, we must watch for array mutators
    if (Array.isArray(value)) {
      return this.data()[prop];
    }
    return value;
  }

  set(values, value) {
    var key, data = this.data();

    if (typeof values === "string") {
      data[values] = copy(value);
      return this;
    }

    if (typeof values === "object") {
      for (key in values) {
        if (values.hasOwnProperty(key)) {
          data[key] = copy(values[key]);
        }
      }
      return this;
    }
  }

  toJSON() {
    return this._data;
  }
}
