define(['real/Promise', 'nbd/Class', 'jquery'], function(Promise, Class, $) {
  'use strict';

  var t = 50;

  // Only tests the additional functionality on top of Promises/A+
  describe('nbd/Promise', function() {
    describe('constructor', function() {
      it('produces unresolved promise', function(done) {
        var p = new Promise(),
        spy = jasmine.createSpy();
        p.then(spy);

        setTimeout(function() {
          expect(spy).not.toHaveBeenCalled();
          done();
        }, t);
      });

      it('can produce immediately rejected promise', function(done) {
        var p = new Promise(),
        spy = jasmine.createSpy();
        p.then(null, spy);
        p.reject('reject');

        setTimeout(function() {
          expect(spy).toHaveBeenCalledWith('reject');
          done();
        }, t);
      });

      it('can chain another resolved thenable', function(done) {
        var o = new Promise(),
        p = new Promise(o.thenable()),
        spy = jasmine.createSpy();
        p.then(spy);

        o.resolve('accept');
        setTimeout(function() {
          expect(spy).toHaveBeenCalledWith('accept');
          done();
        }, t);
      });

      it('can chain another rejected thenable', function(done) {
        var o = new Promise(),
        p = new Promise(o.thenable()),
        spy = jasmine.createSpy();
        p.then(null, spy);

        o.reject('accept');
        setTimeout(function() {
          expect(spy).toHaveBeenCalledWith('accept');
          done();
        });
      });
    });

    describe('resolved', function() {
      it('creates a resolved promise', function(done) {
        var p = Promise.resolved('alpha'),
        spy = jasmine.createSpy();
        p.then(spy);

        setTimeout(function() {
          expect(spy).toHaveBeenCalledWith('alpha');
          done();
        });
      });
    });

    describe('rejected', function() {
      it('creates a rejected promise', function(done) {
        var p = Promise.rejected('alpha'),
        goodSpy = jasmine.createSpy(),
        badSpy = jasmine.createSpy();
        p.then(goodSpy, badSpy);

        setTimeout(function() {
          expect(goodSpy).not.toHaveBeenCalled();
          expect(badSpy).toHaveBeenCalledWith('alpha');
          done();
        }, t);
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

      it('can be controlled by original promise', function(done) {
        var sentinel = jasmine.createSpy('then callback');

        promise.then(sentinel);
        p.resolve('original');

        setTimeout(function() {
          expect(sentinel).toHaveBeenCalledWith('original');
          done();
        }, t);
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

      it('conveniences all arguments to always', function(done) {
        var spy1 = jasmine.createSpy(), spy2 = jasmine.createSpy();

        promise.always(spy1, spy2);

        inst.resolve('promise land');
        setTimeout(function() {
          expect(spy1).toHaveBeenCalledWith('promise land');
          expect(spy2).toHaveBeenCalledWith('promise land');
          done();
        }, t);
      });

      it('is compatible with jQuery Deferreds', function(done) {
        var onDone = jasmine.createSpy('jQuery onDone');

        $.when(promise, undefined).done(onDone);

        inst.resolve('promise land');
        setTimeout(function() {
          expect(onDone).toHaveBeenCalledWith('promise land', undefined);
          done();
        }, t);
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
        expect(promise.then.calls.argsFor(0)[1]).toBe(spy);
      });

      it('does not call back on resolved', function(done) {
        var spy = jasmine.createSpy();
        promise.catch(spy);
        promise.resolve(42);
        setTimeout(function() {
          expect(spy).not.toHaveBeenCalled();
          done();
        }, t);
      });

      it('calls back on rejected', function(done) {
        var spy = jasmine.createSpy();
        promise.catch(spy);
        promise.reject(Infinity);
        setTimeout(function() {
          expect(spy).toHaveBeenCalledWith(Infinity);
          done();
        }, t);
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

      it('calls back on resolved', function(done) {
        var spy = jasmine.createSpy();
        promise.finally(spy);
        promise.resolve(42);
        setTimeout(function() {
          expect(spy).toHaveBeenCalledWith(42);
          done();
        }, t);
      });

      it('calls back on rejected', function(done) {
        var spy = jasmine.createSpy();
        promise.finally(spy);
        promise.reject(Infinity);
        setTimeout(function() {
          expect(spy).toHaveBeenCalledWith(Infinity);
          done();
        }, t);
      });
    });
  });

  return Promise;
});
