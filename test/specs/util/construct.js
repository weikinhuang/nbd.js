define(['real/util/construct'], function(construct) {
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

      for (i=0; i < Math.random() * 10; ++i) {
        testArr.push(Math.random());
      }

      inst = construct.apply(Constructor, testArr);

      expect(args).not.toBe(testArr);
      expect(args).toEqual(testArr);
    });

    it('constructors with return values', function() {
      function Constructor() {
        return [];
      }

      var inst = construct.call(Constructor);
      expect(inst).toEqual(jasmine.any(Array));
    });

    it("can't construct non-functions", function() {
      expect(function() {
        construct();
      }).toThrow();

      expect(function() {
        construct.call({});
      }).toThrow();

      expect(function() {
        construct.call(true);
      }).toThrow();

      expect(function() {
        construct.call(Infinity);
      }).toThrow();

      expect(function() {
        construct.call(/.*/);
      }).toThrow();
    });
  });

  return construct;
});
