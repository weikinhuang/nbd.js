/*global jasmine, describe, it, expect, spyOn, loadFixtures */
define(['real/util/extend'], function(extend) {
  'use strict';

  describe('util/extend', function() {
    var a = {one:true}, 
    b = {two:true}, 
    c = {one:false, three:true};

    it('should add properties to first argument from subsequent arguments', function() {
      var result = extend(a, b);
      expect(result.one).toBe(true);
      expect(result.two).toBe(true);
      expect(result.three).not.toBeDefined();

      result = extend(a, b, c);
      expect(result.one).toBe(false);
      expect(result.two).toBe(true);
      expect(result.three).toBe(true);
    });
  });

  return extend;
});
