import Base from './Class';
import View from './View';
import Model from './Model';
import pubsub from './trait/pubsub';

const ModelClassSymbol = Symbol("Model");
const ViewClassSymbol = Symbol("View");
export { ModelClassSymbol, ViewClassSymbol };

class Controller extends Base.with(pubsub, {
  [ViewClassSymbol]: View,
  [ModelClassSymbol]: Model
}) {
  constructor(...args) {
    // Backward compatibility
    if (this.constructor.MODEL_CLASS) {
      this[ModelClassSymbol] = this.constructor.MODEL_CLASS;
    }
    if (this.constructor.VIEW_CLASS) {
      this[ViewClassSymbol] = this.constructor.VIEW_CLASS;
    }

    this._initModel(this[ModelClassSymbol], ...args);
    this.requestView();
  }

  render($parent, ViewClass) {
    this.requestView(ViewClass);
    return new Promise(resolve => resolve(this._view.render($parent)));
  }

  destroy() {
    try { this._view.destroy(); }
    finally { delete this._view; }

    try { this._model.destroy(); }
    finally { delete this._model; }

    this.trigger('destroy').stopListening().off();
  }

  _initModel(ModelClass, ...args) {
    return this._model = new ModelClass(...args);
  }

  _initView(ViewClass, ...args) {
    this._view = new ViewClass(...args);
    this._view._controller = this;
    return this._view;
  }

  switchView(ViewClass, ...args) {
    var existing = this._view;
    this._initView(ViewClass, ...args);

    if (!existing) { return; }

    if (existing.$view) {
      this._view.$view = existing.$view;
      this._view.render();
    }

    existing.destroy();
  }

  requestView(ViewClass = this[ViewClassSymbol]) {
    if (typeof ViewClass === 'string') {
      ViewClass = this[ViewClassSymbol][ViewClass];
    }
    if (typeof ViewClass !== 'function' || this._view instanceof ViewClass) {
      return;
    }
    this.switchView(ViewClass, this._model);
  }

  get data() {
    return this._model.data();
  }

  toJSON() {
    return this._model.toJSON();
  }

  static with(...mixins) {
    for (let one of mixins) {
      if (one.hasOwnProperty('Model')) {
        one[ModelClassSymbol] = one.Model;
        delete one.Model;
      }
      if (one.hasOwnProperty('View')) {
        one[ViewClassSymbol] = one.View;
        delete one.View;
      }
    }
    return super.with(...mixins);
  }
}

export default Controller;
