define(['real/trait/pubsub', 'nbd/util/extend'], function(pubsub, extend) {
  'use strict';

  describe('trait/pubsub', function() {
    var obj, spy;

    beforeEach(function() {
      obj = extend({}, pubsub);
      spy = jasmine.createSpy('callback');
    });

    describe('.on()', function() {
      it("on and trigger", function() {
        obj.on('event', spy);
        obj.trigger('event');
        expect(spy).toHaveBeenCalled();
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        expect(spy.calls.count()).toBe(5);
      });

      it("binds and triggers multiple events", function() {
        obj.on('a b c', spy);

        obj.trigger('a');
        expect(spy.calls.count()).toEqual(1);

        obj.trigger('a b');
        expect(spy.calls.count()).toEqual(3);

        obj.trigger('c');
        expect(spy.calls.count()).toEqual(4);

        obj.off('a c');
        obj.trigger('a b c');
        expect(spy.calls.count()).toEqual(5);
      });

      it('binds an object hash of functions', function() {
        obj.on({
          a: spy,
          b: spy,
          c: spy
        });

        obj.trigger('a');
        expect(spy.calls.count()).toEqual(1);

        obj.trigger('a b');
        expect(spy.calls.count()).toEqual(3);

        obj.trigger('c');
        expect(spy.calls.count()).toEqual(4);

        obj.off('a c');
        obj.trigger('a b c');
        expect(spy.calls.count()).toEqual(5);
      });

      it("binds a callback with a supplied context", function() {
        var obj,
        TestClass = function() {},
        instance = new TestClass();

        obj = extend({}, pubsub);
        obj.on('event', function() {
          expect(this).toBe(instance);
        }, instance);
        obj.trigger('event');
      });

      it("if no callback is provided, `on` is a noop", function() {
        obj.on('test').trigger('test');
      });

      it("'all' callback list is retrieved after each event.", function() {
        obj.on('x', function() {
          obj.on('y', spy).on('all', spy);
        })
        .trigger('x y');
        expect(spy.calls.count()).toEqual(2);
      });
    });

    describe('.one()', function() {
      it('binds a callback once', function() {
        obj.one('event', spy);
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        expect(spy.calls.count()).toBe(1);
      });

      it('binds inside a callback', function(done) {
        obj.one('fool', function() {
          obj.one('fool', done);
        });
        obj.trigger('fool');
        obj.trigger('fool');
      });

      it('does not stop other bound callbacks from firing', function() {
        var spy2 = jasmine.createSpy();
        obj.one('event', spy);
        obj.on('event', spy2);
        obj.trigger('event');
        expect(spy.calls.count()).toBe(1);
        expect(spy2.calls.count()).toBe(1);
      });

      it("if no callback is provided, `one` is a noop", function() {
        obj.one('test').trigger('test');
      });
    });

    describe('.trigger()', function() {
      it("trigger all for each event", function() {
        obj.on('all', spy)
        .trigger('a b');

        expect(spy).toHaveBeenCalledWith('a');
        expect(spy).toHaveBeenCalledWith('b');
        expect(spy.calls.count()).toEqual(2);
      });

      it("callback list is not altered during trigger", function() {
        var cb = jasmine.createSpy();

        obj.on('event', function() {
          obj.on('event', cb).on('all', cb);
        })
        .trigger('event');

        expect(cb).not.toHaveBeenCalled();

        obj.off()
        .on('event', function() {
          obj.off('event', cb).off('all', cb);
        })
        .on('event', cb).on('all', cb)
        .trigger('event');
        expect(cb.calls.count()).toEqual(2);
      });

      it("fires callbacks after an error is thrown", function() {
        spy.and.throwError();
        obj.on('event', spy);

        expect(function() { obj.trigger('event'); }).toThrow();
        expect(function() { obj.trigger('event'); }).toThrow();
        expect(spy).toHaveBeenCalled();
        expect(spy.calls.count()).toBe(2);
      });
    });

    describe('.off()', function() {
      it("on, then unbind all functions", function() {
        obj.on('event', spy);
        obj.trigger('event');
        obj.off('event');
        obj.trigger('event');
        expect(spy.calls.count()).toEqual(1);
      });

      it("bind two callbacks, unbind only one", function() {
        var callback = jasmine.createSpy('secondary');
        obj.on('event', spy);
        obj.on('event', callback);
        obj.trigger('event');
        obj.off('event', callback);
        obj.trigger('event');
        expect(callback.calls.count()).toEqual(1);
        expect(spy.calls.count()).toEqual(2);
      });

      it("unbind a callback in the midst of it firing", function() {
        spy.and.callFake(function() {
          obj.off('event', spy);
        });
        obj.on('event', spy);
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        expect(spy.calls.count()).toEqual(1);
      });

      it("two binds that unbind themeselves", function() {
        var cb = jasmine.createSpy('secondary');
        spy.and.callFake(function() { obj.off('event', spy); });
        cb.and.callFake(function() { obj.off('event', cb); });
        obj.on('event', spy);
        obj.on('event', cb);
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        expect(spy.calls.count()).toEqual(1);
        expect(cb.calls.count()).toEqual(1);
      });

      it("remove all events for a specific context", function() {
        obj.on('x y all', spy);
        obj.on('x y all', function() { throw new Error('Unreacheable'); }, obj);
        obj.off(null, null, obj);

        expect(function() {
          obj.trigger('x y');
        }).not.toThrow();

        expect(spy).toHaveBeenCalled();
      });

      it("remove all events for a specific callback", function() {
        var obj = extend({},  pubsub),
        success = jasmine.createSpy('success'),
        fail = function() { throw new Error('failure case'); };
        obj.on('x y all', success);
        obj.on('x y all', fail);
        obj.off(null, fail);

        expect(function() {
          obj.trigger('x y');
        }).not.toThrow();

        expect(success).toHaveBeenCalled();
      });

      it("off is chainable", function() {
        var obj = extend({},  pubsub);
        // With no events
        expect(obj.off()).toBe(obj);
        // When removing all events
        obj.on('event', function() {}, obj);
        expect(obj.off()).toBe(obj);
        // When removing some events
        obj.on('event', function() {}, obj);
        expect(obj.off()).toBe(obj);
      });

      it("nested trigger with unbind", function() {
        var cb = jasmine.createSpy('secondary')
        .and.callFake(function() {
          obj.off('event', cb).trigger('event');
        });
        obj.on('event', spy);
        obj.on('event', cb);
        obj.trigger('event');
        expect(spy.calls.count()).toEqual(2);
        expect(cb.calls.count()).toEqual(1);
      });

      it("does not skip consecutive events", function() {
        obj.on('event', function() { throw new Error(); }, obj);
        obj.on('event', function() { throw new Error(); }, obj);
        obj.off(null, null, obj);

        expect(function() {
          obj.trigger('event');
        }).not.toThrow();
      });
    });

    describe('.listenTo()', function() {
      it("listenTo and stopListening", function() {
        var a = extend({}, pubsub),
        b = extend({}, pubsub),
        spyA = jasmine.createSpy('a');

        a.listenTo(b, 'all', spyA);
        b.trigger('anything');
        a.listenTo(b, 'all', spyA);
        a.stopListening();
        b.trigger('anything');

        expect(spyA).toHaveBeenCalled();
        expect(spyA.calls.count()).toBe(1);
      });

      it("supports function as calling context", function() {
        extend(spy, pubsub);

        spy.listenTo(obj, 'event');
        obj.trigger('event');
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('.stopListening()', function() {
      it("selectively unbinds", function() {
        var a = extend({}, pubsub),
        b = extend({}, pubsub);

        obj.listenTo(a, 'event', spy);
        obj.listenTo(b, 'event', spy);
        obj.stopListening(a);
        a.trigger('event');
        b.trigger('event');
        expect(spy.calls.count()).toBe(1);
      });

      it("selectively unbinds events", function() {
        var a = extend({}, pubsub);

        obj.listenTo(a, 'event horizon', spy);
        obj.stopListening(a, 'horizon');
        a.trigger('event');
        expect(spy.calls.count()).toBe(1);
      });
    });

    describe('.relay()', function() {
      var other;
      beforeEach(function() {
        other = extend({}, pubsub);
      });

      it('retriggers a named event', function() {
        obj.relay(other, 'event');
        obj.on('event', spy);
        other.trigger('event', 'foobar');
        expect(spy).toHaveBeenCalledWith('foobar');
      });

      it('retriggers multiple named events', function() {
        obj.relay(other, 'foo bar baz boss');
        obj.on('bar', spy);
        other.trigger('bar', 'foobar');
        expect(spy).toHaveBeenCalledWith('foobar');
      });

      it('retriggers the all event', function() {
        obj.relay(other, 'all');
        obj.on('fun', spy);
        other.trigger('sad');
        expect(spy).not.toHaveBeenCalled();
        other.trigger('fun');
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  return pubsub;
});
