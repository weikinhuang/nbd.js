export interface PromiseTrait<T> {
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
  finally(onAny: (data?: any) => any): Promise<T>;
  resolve(value: T): this;
  reject(value: any): this;
  thenable(): any;
  promise(): Promise<T>;
}

declare const _default: PromiseTrait<any>;
export default _default;
