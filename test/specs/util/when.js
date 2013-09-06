/*global jasmine, describe, it, expect, runs, waitsFor, beforeEach, waits */
define(['real/util/when', 'nbd/trait/promise'], function(when, Promise) {
  'use strict';

  ddescribe('util/when', function() {

    var promise, sentinel;

    beforeEach(function() {
      promise = new Promise();
      sentinel = jasmine.createSpy('then callback');
    });

    it('is a function', function() {
      expect(when).toEqual(jasmine.any(Function));
    });

    it('resolves when promise resolves', function() {
      when(promise).then(sentinel);

      promise.resolve('original');
      waits(15);

      runs(function() {
        expect(sentinel).toHaveBeenCalledWith('original');
      });
    });

    it('resolves when last promise resolves', function() {
      when('a', promise).then(sentinel);

      waits(15);

      runs(function() {
        expect(sentinel).not.toHaveBeenCalled();
        promise.resolve('original');
      });

      waits(15);

      runs(function() {
        expect(sentinel).toHaveBeenCalledWith(['a', 'original']);
      });
    });

  });

  return when;

});
