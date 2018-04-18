import { PubSubTrait } from './trait/pubsub';

export interface Logger extends PubSubTrait {
  new(name: any): this;

  levels: string[];
  name: string;
  container: any;
  level: string;

  destroy(): void;
  setLevel(level: string): void;
  attach(route: any): void;
  remove(route: any): void;

  debug(...args: any[]): void;
  log(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;

  _log(level: string): void;
  _name(): string;
}

interface LoggerConstructor {
  get(name: string): Logger;
  attach(handler: Function): void;
  setLevel(levelOrMap: any): void;
  global(level: string, message: string): any;
  console(level: string, message: string): any;

  displayName: string;
}

declare const _default: LoggerConstructor;
export default _default;
