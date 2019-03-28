export type evtCallback = (...args: any[]) => any;

export interface PubSubTrait {
  on(event: string, callback: evtCallback, context?: any): this;
  one(event: string, callback: evtCallback, context?: any): this;
  off(event: string, callback?: evtCallback, context?: any): this;
  trigger(event: string, ...args: any[]): this;
  listenTo(object: PubSubTrait, events: string | { [event: string]: evtCallback }, callback?: evtCallback): this;
  listenOnce(object: PubSubTrait, events: string | { [event: string]: evtCallback }, callback?: evtCallback): this;
  stopListening(object: PubSubTrait, events?: string, callback?: evtCallback): this;
  relay(object: PubSubTrait, events: string): this;
}

declare const _default: PubSubTrait;
export default _default;
