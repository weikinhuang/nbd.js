import {
  ViewConstructorProps,
  ViewConstructor as NbdViewConstructor,
  ViewInstance as NbdViewInstance,
  NbdElement,
} from '../View';
export { ViewConstructorProps } from '../View';

export interface ViewInstance extends NbdViewInstance {
  $parent: NbdElement;
}

export interface ViewConstructor<I extends ViewInstance> extends ViewConstructorProps, NbdViewConstructor<I> {
  new(...args: any[]): I;

  // we have to override here because we want to return a classbuilder that has additional props
  extend<T extends I, G extends {} = {}>(a: T, b?: G): ViewConstructor<T> & G & ViewConstructorProps;
}

declare const _default: ViewConstructor<ViewInstance>;
export default _default;
