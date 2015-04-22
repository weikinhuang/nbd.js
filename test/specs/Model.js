define(['real/Model', 'nbd/Class'], function(Model, Class) {
  'use strict';

  var t = 20;

  describe('Model', function() {
    it('is a Class constructor', function() {
      expect(Model).toEqual(jasmine.any(Function));
      expect(Model.inherits(Class)).toBe(true);
    });

    describe('.init()', function() {
      it('initializes with data', function() {
        var rand = Math.random(),
        instance = new Model(1, {xyz: rand}),
        data;

        expect(instance.id()).toBe(1);
        expect(data = instance.data()).toEqual(jasmine.any(Object));
        expect(data.xyz).toBe(rand);
      });

      it('allows just an id', function() {
        var instance = new Model(42);
        expect(instance.id()).toBe(42);
        expect(instance.data()).toEqual(jasmine.any(Object));
      });

      it('supports numeric string ids', function() {
        var instance = new Model('42');
        expect(instance.id()).toBe(42);
        expect(instance.data()).toEqual(jasmine.any(Object));
      });

      it('supports non-numeric ids', function() {
        var instance = new Model("xyz", {});
        expect(instance.id()).toBe('xyz');

        instance = new Model(-1, {});
        expect(instance.id()).toBe(-1);
      });

      it('has optional id', function() {
        var foo = { bar: Infinity },
        instance = new Model(foo);

        expect(instance.id()).not.toBeDefined();
        expect(instance.data()).toEqual(foo);
      });

      it('has optional data as well', function() {
        var instance = new Model();
        expect(instance.id()).not.toBeDefined();
        expect(instance.data()).toEqual(jasmine.any(Object));
      });

      it('works without Object.defineProperty', function() {
        var defineProperty = Object.defineProperty, instance;
        // Careful...
        Object.defineProperty = undefined;

        expect(Object.defineProperty).not.toBeDefined();
        expect(function() {
          instance = new Model();
        }).not.toThrow();
        expect(instance).toBeDefined();

        // Carefully put it back and hope nobody notices.
        Object.defineProperty = defineProperty;
      });
    });

    describe('.get()', function() {
      it('returns a value', function() {
        var rand = Math.random(), instance = new Model(1, {xyz: rand});
        expect(instance.get('xyz')).toBe(rand);
      });

      it('returns unepxected property names as undefined', function() {
        var instance = new Model(1, {xyz: 'xyz'});
        expect(instance.get('abc')).not.toBeDefined();
      });

      it('returns undefined values', function() {
        var instance = new Model(1, {xyz: undefined});
        expect(instance.get('xyz')).not.toBeDefined();
      });
    });

    describe('.set()', function() {
      var rand, instance;

      beforeEach(function() {
        rand = Math.random();
        instance = new Model(1, {xyz: null, foo: 'bar'});
      });

      it('accepts an object map', function() {
        expect(function() { instance.set({xyz: 0}); }).not.toThrow();
        expect(instance.get('xyz')).toBe(0);
      });

      it('accepts a key/value pair', function() {
        expect(function() { instance.set('xyz', rand); }).not.toThrow();
        expect(instance.get('xyz')).toBe(rand);
      });

      it('ignores any other arguments', function() {
        expect(function() { instance.set(); }).not.toThrow();
        expect(function() { instance.set(32, 64); }).not.toThrow();
        expect(function() { instance.set(function() {}); }).not.toThrow();
        expect(function() { instance.set(null); }).not.toThrow();
      });

      describe('announces changes to the data object', function() {
        var result = 0, cb;

        beforeEach(function() {
          cb = jasmine.createSpy('change catcher');
        });

        afterEach(function() {
          result = 0;
        });

        it('announces singular set() calls', function(done) {
          instance.on('foo', cb);
          instance.set('foo', 'baq');

          setTimeout(function() {
            expect(cb).toHaveBeenCalledWith('baq', 'bar');
            expect(instance.get('foo')).toBe('baq');
            done();
          }, t);
        });

        it('mutes singular identical set() calls', function(done) {
          instance.on('foo', cb);
          instance.set('foo', 'baz');
          instance.set('foo', 'bar');

          setTimeout(function() {
            expect(cb).not.toHaveBeenCalled();
            expect(instance.get('foo')).toBe('bar');
            done();
          }, t);
        });

        it('announces mapped set() calls', function(done) {
          instance.on('foo', cb);
          instance.on('xyz', cb);
          instance.set({ foo: 'baz', xyz: 42 });

          setTimeout(function() {
            expect(cb.calls.count()).toBe(2);
            expect(cb.calls.argsFor(1)).toEqual(['baz', 'bar']);
            expect(cb.calls.argsFor(0)).toEqual([42, null]);
            expect(instance.get('foo')).toBe('baz');
            expect(instance.get('xyz')).toBe(42);
            done();
          }, t);
        });

        it('mutes identical mapped set() calls', function(done) {
          instance.on('foo', cb);
          instance.on('xyz', cb);
          instance.set({ foo: 'bar', xyz: null });

          setTimeout(function() {
            expect(cb).not.toHaveBeenCalled();
            expect(instance.get('foo')).toBe('bar');
            expect(instance.get('xyz')).toBe(null);
            done();
          }, t);
        });
      });
    });

    describe('.data()', function() {
      var data, instance;

      beforeEach(function() {
        data = { foo: 'bar', arr: [], obj: {} };
        instance = new Model(data);
      });

      it('returns the data object', function() {
        expect(instance.data()).toEqual(data);
      });

      describe('watches for changes', function() {
        var result = 0, cb;

        beforeEach(function() {
          cb = jasmine.createSpy('change catcher');
        });

        afterEach(function() {
          result = 0;
        });

        it('announces property changes', function(done) {
          var d = instance.data();
          instance.on('foo', cb);
          d.foo = 'baz';

          setTimeout(function() {
            expect(cb).toHaveBeenCalledWith('baz', 'bar');
            expect(instance.get('foo')).toBe('baz');
            done();
          }, t);
        });

        it('announces array modifications', function(done) {
          var d = instance.data();
          instance.on('arr', cb);
          d.arr.push(1);

          setTimeout(function() {
            expect(instance.get('arr').length).not.toBe(0);
            done();
          }, t);
        });

        it('announces originals when using complex objects', function(done) {
          function A() {}
          function B() {}

          var a = new A(),
          b = new B(),
          instance = new Model({ a: a }),
          spy = jasmine.createSpy('complex spy');

          instance.on('a', spy);
          instance.set('a', b);

          setTimeout(function() {
            expect(spy).toHaveBeenCalledWith(b, a);
            done();
          }, t);
        });

        it('can mix calls to .set() before', function(done) {
          instance.on('foo', cb);
          instance.set('foo', 'goats');
          var d = instance.data();
          d.foo = 'baz';

          setTimeout(function() {
            expect(cb.calls.count()).toBe(1);
            expect(cb).toHaveBeenCalledWith('baz', 'bar');
            expect(instance.get('foo')).toBe('baz');
            done();
          }, t);
        });

        it('can mix calls to .set() after', function(done) {
          var d = instance.data();
          instance.on('foo', cb);
          d.foo = 'baz';
          instance.set('foo', 'goats');

          setTimeout(function() {
            expect(cb.calls.count()).toBe(1);
            expect(cb).toHaveBeenCalledWith('goats', 'bar');
            expect(instance.get('foo')).toBe('goats');
            done();
          }, t);
        });

        it('can mix calls to .set() during event callback', function(done) {
          instance.on('foo', cb.and.callFake(function() {
            instance.set('id', 24601);
          }));

          var spy = jasmine.createSpy('chained');
          instance.on('id', spy);

          instance.set('foo', 'baz');

          setTimeout(function() {
            expect(cb.calls.count()).toBe(1);
            expect(cb).toHaveBeenCalledWith('baz', 'bar');
            expect(spy).toHaveBeenCalledWith(24601, undefined);
            done();
          }, t);
        });
      });
    });

    describe('.toJSON()', function() {
      var data = { foo: 'bar' },
      instance = new Model(0, data);

      it('returns the same data as .data()', function() {
        expect(instance.toJSON()).toBe(instance.data());
      });

      it('allows JSON.stringify of the model', function() {
        expect(JSON.stringify(instance)).toEqual(JSON.stringify(instance.data()));
      });
    });

    describe('.default', function() {
      it('specifies the default data', function() {
        var model = new (Model.extend({
          default: {
            shim: 'sham'
          }
        }))({
          foo: 'bar'
        });

        expect(model.get('foo')).toBe('bar');
        expect(model.get('shim')).toBe('sham');
      });
    });

    describe('.destroy()', function() {
      var data = { foo: 'bar' },
      instance = new Model(0, data);

      it('removes all event bindings', function() {
        var cb = jasmine.createSpy();
        instance.on('foo', cb);
        instance.destroy();
        instance.trigger('foo', 'baz');

        expect(cb).not.toHaveBeenCalled();
      });
    });
  });

  return Model;
});
