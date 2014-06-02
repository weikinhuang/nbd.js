define(['real/trait/promise', 'nbd/Class', 'jquery'], function(promise, Class, $) {
  'use strict';
  // Only ever test nbd related functionality here
  // Actual Promise/A+ testing done in test/lib/promise-adapter

  describe('trait/promise', function() {
    var Klass, inst;

    beforeEach(function() {
      Klass = Class.extend();
      inst = new Klass();
    });

    it('can be mixin()ed', function() {
      expect(function() {
        Klass.mixin(promise);
      }).not.toThrow();
    });

    beforeEach(function() {
      Klass.mixin(promise);
    });

    describe('.then()', function() {
      it('can be mixin()ed', function() {
        expect(inst.then).toEqual(jasmine.any(Function));
      });

      it('returns a promise', function() {
        var promise = inst.then();

        expect(promise.then).toEqual(jasmine.any(Function));
      });
    });

    describe('.resolve()', function(done) {
      it('resolves the promise', function() {
        var sentinel = jasmine.createSpy('then callback');

        inst.then(sentinel)
        .then(function() {
          expect(sentinel).toHaveBeenCalledWith('original');
        })
        .finally(done);

        inst.resolve('original');
      });

      it('callsback when the promise has already resolved', function(done) {
        var sentinel = jasmine.createSpy('then callback');

        inst.resolve('original');
        inst.then(sentinel)
        .then(function() {
          expect(sentinel).toHaveBeenCalledWith('original');
        })
        .finally(done);
      });
    });

    describe('.reject()', function() {
      it('rejects the promise', function(done) {
        var fake = jasmine.createSpy(),
        sentinel = jasmine.createSpy('then callback');

        inst.then(fake, sentinel);
        inst.reject('original');

        inst.then(function() {
          expect(fake).not.toHaveBeenCalled();
          expect(sentinel).toHaveBeenCalledWith('original');
        })
        .finally(done);
      });

      it('callsback when the promise has already rejected', function(done) {
        var fake = jasmine.createSpy(),
        sentinel = jasmine.createSpy('then callback');

        inst.reject('original');
        inst.then(fake, sentinel);

        inst.then(function() {
          expect(fake).not.toHaveBeenCalled();
          expect(sentinel).toHaveBeenCalledWith('original');
        })
        .finally(done);
      });
    });

    describe('.thenable()', function() {
      it('returns an object with then()', function() {
        var thenable = inst.thenable();

        expect(thenable).toEqual(jasmine.any(Object));
        expect(thenable.then).toEqual(jasmine.any(Function));
      });
    });

    describe('.promise()', function() {
      it('returns an object with itself', function() {
        var promise = inst.promise();

        expect(promise).toEqual(jasmine.any(Object));
        expect(promise.promise()).toEqual(promise);
      });

      it('returns an object with done()', function() {
        var promise = inst.promise();
        expect(promise.done).toEqual(jasmine.any(Function));
      });

      it('returns an object with fail()', function() {
        var promise = inst.promise();
        expect(promise.fail).toEqual(jasmine.any(Function));
      });

      it('returns an object with always()', function() {
        var promise = inst.promise();
        expect(promise.always).toEqual(jasmine.any(Function));
      });
    });
  });

  return promise;
});
