import { ClassBuilder } from './Class';
import { ModelInstance, ModelConstructor } from './Model';
import { ViewInstance, ViewConstructor } from './View';
import { PubSubTrait } from './trait/pubsub';

export interface ControllerInstance extends PubSubTrait {
  new(...args: any[]): this;

  // from nbd class
  _super(...args: any[]): any;
  init(config?: any): void;

  _view: ViewInstance;
  _model: any;

  readonly id: string;
  readonly data: any;

  render($parent: JQuery | HTMLElement, ViewClass: ViewInstance): Promise<JQuery>;
  destroy(): void;
  _initModel(...args: any[]): void;
  _initView(...args: any[]): void;
  switchView(...args: any[]): void;
  requestView(ViewClass: ViewInstance): void;
  toJSON(): any;
}

export interface ControllerConstructorProps<V = ViewConstructor, M = ModelConstructor> {
  displayName: string;

  VIEW_CLASS: V;
  MODEL_CLASS: M;
}

export interface ControllerConstructor<I extends ControllerInstance = ControllerInstance> extends ControllerConstructorProps, ClassBuilder<I> {
  new(...args: any[]): I;

  // we have to override here because we want to return a classbuilder that has additional props
  extend<T extends I, G extends {} = {}>(a: T, b?: G): ControllerConstructor<T> & G & ControllerConstructorProps<T>;
}

declare const Controller: ControllerConstructor;
export default Controller;
