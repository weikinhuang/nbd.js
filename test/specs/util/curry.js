/*global jasmine, describe, it, expect, beforeEach */
define(['real/util/curry'], function(curry) {
  'use strict';

  describe('util/curry', function() {
    var spy;

    beforeEach(function() {
      spy = jasmine.createSpy('spycy');
    });

    it('produces a function', function() {
      var curried = curry(spy);
      expect(curried).toEqual(jasmine.any(Function));
    });

    describe('curried function', function() {
      it('produces a function', function() {
        var curried = curry(spy)('alpha');
        expect(curried).toEqual(jasmine.any(Function));

        curried('beta');
        expect(spy).toHaveBeenCalledWith('alpha', 'beta');
      });

      it('preserves context', function() {
        var originalContext, ctxt = {};
        spy.andCallFake(function() {
          originalContext = this;
        });

        var curried = curry(spy)();
        curried.call(ctxt);

        expect(spy).toHaveBeenCalled();
        expect(originalContext).toBe(ctxt);
      });

      it('can be called multiple times', function() {
        var curried = curry(spy)('alpha', 'beta', 'gamma');

        curried('delta');
        expect(spy).toHaveBeenCalledWith('alpha', 'beta', 'gamma', 'delta');
        curried('epsilon');
        expect(spy).toHaveBeenCalledWith('alpha', 'beta', 'gamma', 'epsilon');
      });

      it('returns curried function\'s return value', function() {
        var obj = {},
        curried = curry(spy.andReturn(obj))();
        expect(curried()).toBe(obj);
      });
    });
  });
});
