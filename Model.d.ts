import { ClassBuilder } from './Class';
import { PubSubTrait } from './trait/pubsub';

export interface ModelInstance extends PubSubTrait {
  new(id: string, data: any): this;

  // from nbd class
  _super(...args: any[]): any;
  init(id: string, data: any): void;

  _id: string;
  _data: any;
  _dirty: number;

  default: any;

  destroy(): void;
  id(): void;
  data(): any;
  get(prop: string): any;
  set(prop: string, value: any): this;
  set(map: Object): this;
  toJSON(): any;
}

export interface ModelConstructorProps {
  displayName: string;
}

export interface ModelConstructor<I extends ModelInstance = ModelInstance> extends ModelConstructorProps, ClassBuilder<I> {
  new(...args: any[]): I;

  // we have to override here because we want to return a classbuilder that has additional props
  extend<T extends I, G extends {} = {}>(a: T, b?: G): ModelConstructor<T> & G;
}

declare const Model: ModelConstructor;
export default Model;
