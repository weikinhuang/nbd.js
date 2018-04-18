export interface ClassBuilder<I> {
  new(...args: any[]): I;

  extend<T extends I, G extends {} = {}>(proto: T, statics?: G): ClassBuilder<T> & G;

  mixin<T>(this: T, ...args: any[]): T;

  inherits(superclass: any): boolean;
}

declare const _default: ClassBuilder<any>;
export default _default;
