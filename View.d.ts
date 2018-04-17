import { ClassBuilder } from './Class';
import { PubSubTrait } from './trait/pubsub';
export type NbdElement = JQuery | HTMLElement;

export interface ViewInstance extends PubSubTrait {
  new(model?: any): this;

  // from nbd class
  _super(...args: any[]): any;
  init(config?: any): void;

  _model: any;
  nests: any;
  id(): string;

  $view: JQuery;
  destroy(): void;
  //template(templateData?: any): string;
  template: any; // cannot use able definition because we use hgn-loader, and causes ts to be confused
  templateData(): any;
  render($parent: NbdElement): JQuery;
  prerender(): void;
  rendered($view: NbdElement): void;
  postrender($view: NbdElement): void;
  _switchNested(key: string, val: any, old: any): void;
}

export interface ViewConstructorProps {
  displayName: string;

  appendTo($child: NbdElement, $parent: NbdElement): JQuery;
  find($root: NbdElement, selector: string): JQuery;
  replace($old: NbdElement, $new: NbdElement): JQuery;
  remove($el: NbdElement): JQuery;
}

export interface ViewConstructor<I extends ViewInstance = ViewInstance> extends ViewConstructorProps, ClassBuilder<I> {
  new(...args: any[]): I;

  // we have to override here because we want to return a classbuilder that has additional props
  extend<T extends I, G extends {} = {}>(a: T, b?: G): ViewConstructor<T> & G;

  domify(html: string): string;
}

declare const View: ViewConstructor;
export default View;
