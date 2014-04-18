/*global jasmine, describe, it, expect, runs, waits, beforeEach, spyOn */
define(['real/Promise', 'nbd/Class', 'jquery'], function(Promise, Class, $) {
  'use strict';

  // Only tests the additional functionality on top of Promises/A+
  describe('nbd/Promise', function() {
    describe('constructor', function() {
      it('produces unresolved promise', function() {
        var p = new Promise(),
        spy = jasmine.createSpy();
        p.then(spy);

        waits(10), runs(function() {
          expect(spy).not.toHaveBeenCalled();
        });
      });

      it('resolves given a parameter', function() {
        var p = new Promise('alpha'),
        spy = jasmine.createSpy();
        p.then(spy);

        waits(10), runs(function() {
          expect(spy).toHaveBeenCalledWith('alpha');
        });
      });

      it('ignores all but first parameter', function() {
        var p = new Promise('alpha', 'beta', 'gamma'),
        spy = jasmine.createSpy();
        p.then(spy);

        waits(10), runs(function() {
          expect(spy).toHaveBeenCalledWith('alpha');
        });
      });

      it('can produce immediately rejected promise', function() {
        var p = new Promise({ then: function() { throw 'reject'; } }),
        spy = jasmine.createSpy();
        p.then(null, spy);

        waits(10), runs(function() {
          expect(spy).toHaveBeenCalledWith('reject');
        });
      });

      it('can chain another resolved thenable', function() {
        var o = new Promise(),
        p = new Promise(o.thenable()),
        spy = jasmine.createSpy();
        p.then(spy);

        o.resolve('accept');
        waits(30), runs(function() {
          expect(spy).toHaveBeenCalledWith('accept');
        });
      });

      it('can chain another rejected thenable', function() {
        var o = new Promise(),
        p = new Promise(o.thenable()),
        spy = jasmine.createSpy();
        p.then(null, spy);

        o.reject('accept');
        waits(30), runs(function() {
          expect(spy).toHaveBeenCalledWith('accept');
        });
      });
    });

    describe('resolved', function() {
      it('creates a resolved promise', function() {
        var p = Promise.resolved('alpha'),
        spy = jasmine.createSpy();
        p.then(spy);

        waits(10), runs(function() {
          expect(spy).toHaveBeenCalledWith('alpha');
        });
      });
    });

    describe('rejected', function() {
      it('creates a rejected promise', function() {
        var p = Promise.rejected('alpha'),
        goodSpy = jasmine.createSpy(),
        badSpy = jasmine.createSpy();
        p.then(goodSpy, badSpy);

        waits(10), runs(function() {
          expect(goodSpy).not.toHaveBeenCalled();
          expect(badSpy).toHaveBeenCalledWith('alpha');
        });
      });
    });

    describe('.thenable()', function() {
      var p;
      beforeEach(function() {
        p = new Promise();
      });

      it('creates an object with .then()', function() {
        var o = p.thenable();
        expect(o).toEqual(jasmine.any(Object));
        expect(o.then).toEqual(jasmine.any(Function));
      });

      it('creates a new object every call', function() {
        var u = p.thenable(), v = p.thenable();
        expect(u).not.toBe(v);
        expect(u.then).toBe(v.then);
      });

      var promise;

      beforeEach(function() {
        promise = p.thenable();
      });

      it('can not be controlled by itself', function() {
        expect(promise.resolve).not.toBeDefined();
        expect(promise.reject).not.toBeDefined();
      });

      it('can be controlled by original promise', function() {
        var sentinel = jasmine.createSpy('then callback');

        promise.then(sentinel);
        p.resolve('original');

        waits(15);

        runs(function() {
          expect(sentinel).toHaveBeenCalledWith('original');
        });
      });
    });

    describe('.promise()', function() {
      var promise, inst = new Promise();

      beforeEach(function() {
        promise = inst.promise();
      });

      it('returns a jQuery Deferrable-compatible object', function() {
        expect(promise.done).toEqual(jasmine.any(Function));
        expect(promise.fail).toEqual(jasmine.any(Function));
        expect(promise.always).toEqual(jasmine.any(Function));
        expect(promise.progress).toEqual(jasmine.any(Function));
        expect(promise.promise).toEqual(jasmine.any(Function));
      });

      it('infinitely returns its own .promise()', function() {
        expect(promise.promise()).toBe(promise);
      });

      it('conveniences all arguments to always', function() {
        var spy1 = jasmine.createSpy(), spy2 = jasmine.createSpy();

        promise.always(spy1, spy2);

        runs(function() {
          inst.resolve('promise land');
        });
        waits(15);
        runs(function() {
          expect(spy1).toHaveBeenCalledWith('promise land');
          expect(spy2).toHaveBeenCalledWith('promise land');
        });
      });

      it('is compatible with jQuery Deferreds', function() {
        var onDone = jasmine.createSpy('jQuery onDone');

        $.when(promise, undefined).done(onDone);

        runs(function() {
          inst.resolve('promise land');
        });
        waits(15);
        runs(function() {
          expect(onDone).toHaveBeenCalledWith('promise land', undefined);
        });
      });
    });

    describe('.catch()', function() {
      var promise;
      beforeEach(function() {
        promise = new Promise();
      });

      it('attaches callbacks with .then', function() {
        var spy = jasmine.createSpy();
        spyOn(promise, 'then');
        promise.catch(spy);
        expect(promise.then).toHaveBeenCalled();
        expect(promise.then.argsForCall[0][1]).toBe(spy);
      });

      it('does not call back on resolved', function() {
        var spy = jasmine.createSpy();
        promise.catch(spy);
        promise.resolve(42);
        waits(10), runs(function() {
          expect(spy).not.toHaveBeenCalled();
        });
      });

      it('calls back on rejected', function() {
        var spy = jasmine.createSpy();
        promise.catch(spy);
        promise.reject(Infinity);
        waits(10), runs(function() {
          expect(spy).toHaveBeenCalledWith(Infinity);
        });
      });
    });

    describe('.finally()', function() {
      var promise;
      beforeEach(function() {
        promise = new Promise();
      });

      it('attaches callbacks with .then', function() {
        var spy = jasmine.createSpy();
        spyOn(promise, 'then');
        promise.finally(spy);
        expect(promise.then).toHaveBeenCalledWith(spy, spy);
      });

      it('calls back on resolved', function() {
        var spy = jasmine.createSpy();
        promise.finally(spy);
        promise.resolve(42);
        waits(10), runs(function() {
          expect(spy).toHaveBeenCalledWith(42);
        });
      });

      it('calls back on rejected', function() {
        var spy = jasmine.createSpy();
        promise.finally(spy);
        promise.reject(Infinity);
        waits(10), runs(function() {
          expect(spy).toHaveBeenCalledWith(Infinity);
        });
      });
    });
  });

  return Promise;
});
