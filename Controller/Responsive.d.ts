import { ResponsiveTrait } from '../trait/responsive';
import {
  ControllerConstructorProps,
  ControllerConstructor as NbdControllerConstructor,
  ControllerInstance as NbdControllerInstance,
} from '../Controller';
export { ControllerConstructorProps } from '../Controller';

export interface ControllerInstance extends NbdControllerInstance, ResponsiveTrait {
  new(id: string, data: any, ...args: any[]): this;
}

export interface ControllerConstructor<I extends ControllerInstance> extends NbdControllerConstructor<I> {
  // we have to override here because we want to return a classbuilder that has additional props
  extend<T extends I, G extends {} = {}>(a: T, b?: G): ControllerConstructor<T> & G & ControllerConstructorProps<T>;
}

declare const _default: ControllerConstructor<ControllerInstance>;
export default _default;
