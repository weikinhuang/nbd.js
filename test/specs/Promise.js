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

      it('calls back with a promise resolver', function() {
        var spy = jasmine.createSpy('resolver'),
        p = new Promise(spy);

        expect(spy).toHaveBeenCalled();
        expect(spy.calls.argsFor(0).length).toBe(2);
        expect(spy.calls.argsFor(0)[0]).toEqual(jasmine.any(Function));
        expect(spy.calls.argsFor(0)[1]).toEqual(jasmine.any(Function));
      });

      it('makes the promise its own resolver without a callback', function() {
        var p = new Promise();

        expect(p.resolve).toBeDefined();
        expect(p.reject).toBeDefined();
      });
    });

    describe('resolve', function() {
      it('creates a resolved promise', function(done) {
        var p = Promise.resolve('alpha'),
        spy = jasmine.createSpy();
        p.then(spy);

        setTimeout(function() {
          expect(spy).toHaveBeenCalledWith('alpha');
          done();
        });
      });
    });

    describe('reject', function() {
      it('creates a rejected promise', function(done) {
        var p = Promise.reject('alpha'),
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

    describe('.race()', function(done) {
      it('resolves when the first promise resolves', function() {
        var o = new Promise(),
        p = new Promise(),
        q = Promise.race([o, p]);

        q.then(function(value) {
          expect(value).toBe('foo');
        })
        .finally(done);

        p.resolve('foo');
        o.reject();
      });

      it('resolves when empty', function(done) {
        expect(function() {
          Promise.race([]);
        }).not.toThrow();
        var spy = jasmine.createSpy();
        Promise.race([]).then(spy)
        .then(function() {
          expect(spy).toHaveBeenCalled();
        })
        .finally(done);
      });
    });

    describe('.all()', function() {
      var promise, sentinel;

      beforeEach(function() {
        promise = new Promise();
        sentinel = jasmine.createSpy('then callback');
      });

      it('is a function', function() {
        expect(Promise.all).toEqual(jasmine.any(Function));
      });

      it('resolves immediate values', function(done) {
        var o = {}, f = function() {}, n = null, u;
        Promise.all([o, f, n, u]).then(sentinel)
        .then(function() {
          expect(sentinel).toHaveBeenCalledWith([o, f, n, u]);
        })
        .finally(done);
      });

      it('resolves when a single promise resolves', function(done) {
        Promise.all([promise]).then(sentinel)
        .then(function() {
          expect(sentinel).toHaveBeenCalledWith(['original']);
        }).finally(done);

        promise.resolve('original');
      });

      it('resolves when last promise resolves', function(done) {
        var last = new Promise();

        Promise.all(['a', last, promise]).then(sentinel)
        .then(function() {
          expect(sentinel).toHaveBeenCalledWith(['a', 'netflix', 'original']);
        })
        .finally(done);

        expect(sentinel).not.toHaveBeenCalled();
        promise.resolve('original');

        expect(sentinel).not.toHaveBeenCalled();
        last.resolve('netflix');
      });

      it('rejects when any promise rejects', function(done) {
        var last = new Promise(),
        fail = jasmine.createSpy('then failback');
        Promise.all([promise, last]).then(sentinel, fail)
        .then(function() {
          expect(fail).toHaveBeenCalledWith('nok');
        }).then(function() {
          last.resolve('ok');
          expect(sentinel).not.toHaveBeenCalled();
        })
        .finally(done);

        promise.reject('nok');

      });

      it('throws on empty calls', function() {
        expect(function() {
          Promise.all();
        }).toThrow();
      });

      it('immediately resolves on an empty array', function(done) {
        expect(function() {
          Promise.all([]);
        }).not.toThrow();

        Promise.all([]).then(sentinel)
        .then(function() {
          expect(sentinel).toHaveBeenCalled();
        })
        .finally(done);
      });
    });
  });

  return Promise;
});
