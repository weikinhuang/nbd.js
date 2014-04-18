/*global jasmine, describe, it, expect, beforeEach */
define(['real/util/curry'], function(curry) {
  'use strict';

  describe('util/curry', function() {
    var spy, curried;

    beforeEach(function() {
      spy = jasmine.createSpy('spycy');
      curried = curry.bind(spy);
    });

    it('only works on function context', function() {
      expect(function() {
        curry.call(function() {});
      }).not.toThrow();

      expect(function() {
        curry.call({});
      }).toThrow();

      expect(function() {
        curry.call(12);
      }).toThrow();

      expect(function() {
        curry.call("Hello");
      }).toThrow();

      expect(function() {
        curry.call(null);
      }).toThrow();

      expect(function() {
        curry();
      }).toThrow();
    });

    it('produces a function', function() {
      expect(curried()).toEqual(jasmine.any(Function));
    });

    describe('curried function', function() {
      it('produces a function', function() {
        var ret = curried('alpha');
        expect(ret).toEqual(jasmine.any(Function));

        ret('beta');
        expect(spy).toHaveBeenCalledWith('alpha', 'beta');
      });

      it('preserves context', function() {
        var originalContext,
        ctxt = { ret: curried() };

        spy.andCallFake(function() {
          originalContext = this;
        });

        ctxt.ret();

        expect(spy).toHaveBeenCalled();
        expect(originalContext).toBe(ctxt);
      });

      it('can be called multiple times', function() {
        var ret = curried('alpha', 'beta', 'gamma');

        ret('delta');
        expect(spy).toHaveBeenCalledWith('alpha', 'beta', 'gamma', 'delta');
        ret('epsilon');
        expect(spy).toHaveBeenCalledWith('alpha', 'beta', 'gamma', 'epsilon');
      });

      it('returns curried function\'s return value', function() {
        var obj = {};
        spy.andReturn(obj);
        expect(curried()()).toBe(obj);
      });
    });
  });

  return curry;
});
