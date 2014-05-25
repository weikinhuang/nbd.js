define(['real/util/when', 'nbd/Promise'], function(when, Promise) {
  'use strict';

  describe('util/when', function() {
    var promise, sentinel;

    beforeEach(function() {
      promise = new Promise();
      sentinel = jasmine.createSpy('then callback');
    });

    it('is a function', function() {
      expect(when).toEqual(jasmine.any(Function));
    });

    it('resolves immediate values', function(done) {
      var o = {}, f = function() {}, n = null, u;
      when(o, f, n, u).then(sentinel)
      .then(function() {
        expect(sentinel).toHaveBeenCalledWith([o, f, n, u]);
      })
      .finally(done);
    });

    it('resolves when promise resolves', function(done) {
      when(promise).then(sentinel)
      .then(function() {
        expect(sentinel).toHaveBeenCalledWith(['original']);
      }).finally(done);

      promise.resolve('original');
    });

    it('resolves when last promise resolves', function(done) {
      var last = new Promise();

      when('a', last, promise).then(sentinel)
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
      when(promise, last).then(sentinel, fail)
      .then(function() {
        expect(fail).toHaveBeenCalledWith('nok');
      }).then(function() {
        last.resolve('ok');
        expect(sentinel).not.toHaveBeenCalled();
      })
      .finally(done);

      promise.reject('nok');

    });

    it('resolves empty calls immediately', function(done) {
      when().then(sentinel)
      .then(function() {
        expect(sentinel).toHaveBeenCalledWith([]);
      }).finally(done);
    });
  });

  return when;
});
