import Base from './Class';
import pubsub from './trait/pubsub';

let _logHandlers = [];
const _levels = {
  debug: true,
  log:  true,
  info: true,
  warn: true,
  error: true
};

class Logger extends Base.with(pubsub, {
  levels: ['debug', 'log', 'info', 'warn', 'error']
}) {
  constructor(name) {
    if (typeof name === 'string') {
      this._name = name;
    }
    else {
      this.container = name;
    }

    this.levels.forEach(function(level) {
      this[level] = this._log.bind(this, level);
    }, this);

    Object.defineProperty(this, 'level', {
      writable: true,
      value: 0
    });

    if (!this.hasOwnProperty('log')) {
      this.log = this[this.levels[0]];
    }
  }

  destroy() {
    this.off();
    this.container = null;
  }

  setLevel(level) {
    let i;
    if (~(i = this.levels.indexOf(level))) {
      this.level = i;
    }
  }

  attach(route) {
    this.on('all', route);
  }

  remove(route) {
    this.off(null, route);
  }

  _log(level, ...params) {
    let i;
    if ((i = this.levels.indexOf(level)) < this.level) { return; }

    this.trigger(this.levels[i], {
      context: this.name,
      params
    });
  }

  get name() {
    let local = this.container &&
      Object.getPrototypeOf(this.container).constructor;
    return this._name || local && (local.displayName || local.name);
  }

  static get(name) {
    const logger = new this(name);
    logger.attach(this.global);
    return logger;
  }

  static attach(handler) {
    if (typeof handler === 'function') {
      _logHandlers.push(handler);
    }
  }

  static setLevel(level, handler) {
    if (typeof level === 'string') {
      _levels[level] = typeof handler === 'function' ? handler : !!handler;
    }
    else if (typeof level === 'object') {
      for (let key in level) {
        this.setLevel(key, level[key]);
      }
    }
  }

  static global(level, message) {
    let allowed = _levels[level];
    allowed = !!(typeof allowed === 'function' ? allowed(message) : allowed);
    return allowed && _logHandlers.forEach(function(handler) {
      handler(level, message);
    });
  }

  static console(level, { context, params }) {
    if (context) {
      params = [`%c${context}`, 'color:#3b3b3b'].concat(params);
    }
    return console[level] && console[level].apply(console, params);
  }
}

Logger.attach(Logger.console);

export default Logger;
