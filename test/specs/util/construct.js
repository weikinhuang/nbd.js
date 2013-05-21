/*global jasmine, describe, it, expect, runs, waitsFor */
define(['nbd/util/construct'], function(construct) {
  'use strict';

  describe('util/construct', function() {
    it('calls `new` on its context', function() {
      var flag, spy, inst;

      spy = jasmine.createSpy('constructor').andCallFake(function() {
        flag = true;
      });

      inst = construct.call(spy);

      expect(spy).toHaveBeenCalled();
      expect(flag).toBe(true);
      expect(inst).toEqual(jasmine.any(spy));
    });

    it('applies all arguments to its context', function() {
      var args, inst, i,
      testArr = [];

      function Constructor() {
        args = arguments;
      }

      for (i=0; i < Math.random()*10; ++i) {
        testArr.push(Math.random());
      }

      inst = construct.apply(Constructor, testArr);

      expect(args).not.toBe(testArr);
      expect(args).toEqual(testArr);
    });
  });
});
