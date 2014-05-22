define(['real/Logger'], function(Logger) {
  'use strict';

  describe('Logger', function() {
    var logger;

    beforeEach(function() {
      logger = new Logger();
    });

    afterEach(function() {
      if (logger) {
        logger.destroy();
        logger = null;
      }
    });

    describe('constructor', function() {
      it('makes an anonymous logger', function() {
        expect(logger.name).not.toBeDefined();
      });

      it('makes a named logger', function() {
        logger = new Logger('foo');
        expect(logger.name).toBe('foo');
      });

      it('stores container', function() {
        var spy = jasmine.createSpy();
        logger = new Logger(spy);

        expect(logger.container).toBe(spy);
        expect(spy).not.toHaveBeenCalled();
      });

      it('attaches log levels as methods', function() {
        logger.levels.forEach(function(level) {
          expect(logger[level]).toEqual(jasmine.any(Function));
        });
      });

      it('always attaches `log` as a method', function() {
        var logger = new (Logger.extend({
          levels: ['panic']
        }))();
        expect(logger.log).toEqual(jasmine.any(Function));
      });
    });

    describe('#attach()', function() {
      it('attaches a handler', function() {
        var spy = jasmine.createSpy();
        logger.attach(spy);

        expect(spy).not.toHaveBeenCalled();
        logger.log('hello world');
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('#remove()', function() {
      it('detaches a handler', function() {
        var spy = jasmine.createSpy();
        logger.attach(spy);
        logger.remove(spy);
        logger.log('hello world');
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('#setLevel()', function() {
      it('throttles messages lower than the level', function() {
        var spy = jasmine.createSpy();
        logger.attach(spy);

        logger.setLevel('error');
        logger.info('swallowed');
        expect(spy).not.toHaveBeenCalled();
      });

      it('allows messages of or higher than the level', function() {
        var spy = jasmine.createSpy();
        logger.attach(spy);

        logger.setLevel('warn');
        logger.warn('warning');
        logger.error('error');
        expect(spy.callCount).toBe(2);
      });

      it('does nothing when no such level', function() {
        var spy = jasmine.createSpy();
        logger.attach(spy);

        logger.setLevel('!!!!');
        logger.info('!!!');
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('context reporting', function() {
      var lastContext,
      handler = function(level, message) {
        lastContext = message.context;
      };

      beforeEach(function() {
        lastContext = undefined;
      });

      it('reports named context', function() {
        logger = new Logger('foo');
        logger.attach(handler);

        logger.log('bar');
        expect(lastContext).toBe('foo');
      });

      it('reports container name', function() {
        function Foobar() {}
        logger = new Logger(new Foobar());
        logger.attach(handler);
        logger.log('baz');
        expect(lastContext).toBe('Foobar');
      });

      it('reports container displayName', function() {
        function Foobar() {}
        Foobar.displayName = "xyzzy";
        logger = new Logger(new Foobar());
        logger.attach(handler);
        logger.log('baz');
        expect(lastContext).toBe("xyzzy");
      });
    });

    describe('.get()', function() {
      it('gets an instance of the logger', function() {
        expect(Logger.get()).toEqual(jasmine.any(Logger));
      });
    });

    describe('.attach()', function() {
      it('adds a global handler', function() {
        spyOn(console, "log");
        var spy = jasmine.createSpy();

        logger = Logger.get();
        Logger.attach(spy);
        logger.log('foobar');
        expect(spy).toHaveBeenCalled();
      });

      it('ignores non-functions', function() {
        spyOn(console, "log");
        Logger.attach({});
        Logger.attach(undefined);
        logger = Logger.get('cool');
        expect(function() {
          logger.log('foobar');
        }).not.toThrow();
      });
    });
  });

  return Logger;
});
