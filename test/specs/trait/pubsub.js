/*global jasmine, describe, it, expect, beforeEach  */
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
        expect(spy.callCount).toBe(5);
      });

      it("binds and triggers multiple events", function() {
        obj.on('a b c', spy);

        obj.trigger('a');
        expect(spy.callCount).toEqual(1);

        obj.trigger('a b');
        expect(spy.callCount).toEqual(3);

        obj.trigger('c');
        expect(spy.callCount).toEqual(4);

        obj.off('a c');
        obj.trigger('a b c');
        expect(spy.callCount).toEqual(5);
      });

      it('binds an object hash of functions', function() {
        obj.on({
          a: spy,
          b: spy,
          c: spy
        });

        obj.trigger('a');
        expect(spy.callCount).toEqual(1);

        obj.trigger('a b');
        expect(spy.callCount).toEqual(3);

        obj.trigger('c');
        expect(spy.callCount).toEqual(4);

        obj.off('a c');
        obj.trigger('a b c');
        expect(spy.callCount).toEqual(5);
      });

      it("binds a callback with a supplied context", function () {
        var obj,
        TestClass = function () {},
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
        expect(spy.callCount).toEqual(2);
      });
    });

    describe('.one()', function() {
      it('binds a callback once', function() {
        obj.one('event', spy);
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        expect(spy.callCount).toBe(1);
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
        expect(spy.callCount).toEqual(2);
      });

      it("callback list is not altered during trigger", function () {
        var cb = jasmine.createSpy();

        obj.on('event', function() {
          obj.on('event', cb).on('all', cb);
        })
        .trigger('event');

        expect(cb).not.toHaveBeenCalled();

        obj.off()
        .on('event', function(){
          obj.off('event', cb).off('all', cb);
        })
        .on('event', cb).on('all', cb)
        .trigger('event');
        expect(cb.callCount).toEqual(2);
      });

      it("fires callbacks after an error is thrown", function() {
        spy.andCallFake(function() { throw new Error(); });
        obj.on('event', spy);

        expect(function() { obj.trigger('event'); }).toThrow();
        expect(function() { obj.trigger('event'); }).toThrow();
        expect(spy).toHaveBeenCalled();
        expect(spy.callCount).toBe(2);
      });
    });

    describe('.off()', function() {
      it("on, then unbind all functions", function() {
        obj.on('event', spy);
        obj.trigger('event');
        obj.off('event');
        obj.trigger('event');
        expect(spy.callCount).toEqual(1);
      });

      it("bind two callbacks, unbind only one", function() {
        var callback = jasmine.createSpy('secondary');
        obj.on('event', spy);
        obj.on('event', callback);
        obj.trigger('event');
        obj.off('event', callback);
        obj.trigger('event');
        expect(callback.callCount).toEqual(1);
        expect(spy.callCount).toEqual(2);
      });

      it("unbind a callback in the midst of it firing", function() {
        spy.andCallFake(function() {
          obj.off('event', spy);
        });
        obj.on('event', spy);
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        expect(spy.callCount).toEqual(1);
      });

      it("two binds that unbind themeselves", function() {
        var cb = jasmine.createSpy('secondary');
        spy.andCallFake(function() { obj.off('event', spy); });
        cb.andCallFake(function() { obj.off('event', cb); });
        obj.on('event', spy);
        obj.on('event', cb);
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        expect(spy.callCount).toEqual(1);
        expect(cb.callCount).toEqual(1);
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
        obj.on('event', function(){}, obj);
        expect(obj.off()).toBe(obj);
        // When removing some events
        obj.on('event', function(){}, obj);
        expect(obj.off()).toBe(obj);
      });

      it("nested trigger with unbind", function () {
        var cb = jasmine.createSpy('secondary')
        .andCallFake(function() {
          obj.off('event', cb).trigger('event');
        });
        obj.on('event', spy);
        obj.on('event', cb);
        obj.trigger('event');
        expect(spy.callCount).toEqual(2);
        expect(cb.callCount).toEqual(1);
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
        expect(spyA.callCount).toBe(1);
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
        expect(spy.callCount).toBe(1);
      });

      it("selectively unbinds events", function() {
        var a = extend({}, pubsub);

        obj.listenTo(a, 'event horizon', spy);
        obj.stopListening(a, 'horizon');
        a.trigger('event');
        expect(spy.callCount).toBe(1);
      });
    });
  });

  return pubsub;
});
