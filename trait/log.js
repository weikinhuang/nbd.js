import Logger from '../Logger';

const privateLogger = Symbol('logger');

export default {
  get log() {
    if (!this[privateLogger]) {
      Object.defineProperty(this, privateLogger, {
        value: Logger.get()
      });
    }
    this[privateLogger].container = this;
    return this[privateLogger];
  }
};
