/*global jasmine, describe, it, expect, runs, waitsFor */
define(['real/util/diff'], function(diff) {
  'use strict';

  describe('util/diff', function() {
    it('is a function', function() {
      expect(diff).toEqual(jasmine.any(Function));
    });

    it('returns an empty object with no differences', function() {
      var o, p, r;

      o = {simple: "foobar"};
      p = {simple: "foobar"};
      r = diff(o,p);

      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(0);
    });
    
    it('returns an array of differences', function() {
      var o, p, r;

      o = {simple: "foobar"};
      p = {simple: "foobaz"};
      r = diff(o,p);

      expect(r).toEqual(jasmine.any(Object));
      expect(r.simple).toBeDefined();
      expect(r.simple[0]).toBe("foobar");
      expect(r.simple[1]).toBe("foobaz");
    });

    it('minimizes differences', function() {
      var o, p, r;

      o = {simple: {}};
      p = {simple: {}};
      r = diff(o,p);

      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(0);
    });

    it('calls a callback for every difference', function() {
      var o, p, r, cb = jasmine.createSpy('diffspy');

      o = {
        unchanged:10,
        simple: "foobar",
        complex: {
          meaning: 42
        }
      };
      p = {
        unchanged:10,
        simple: "foobaz",
        complex: {
          meaning: '42'
        }
      };
      r = diff(o, p, cb);

      expect(cb).toHaveBeenCalledWith('simple','foobar','foobaz');
      expect(cb).toHaveBeenCalledWith('complex',o.complex,p.complex);
      expect(cb.callCount).toBe(2);
    });

    it('does not infinitely recurse', function() {
      var r,
      o = {},
      p = {};

      o.self = o;
      p.self = o;
      r = diff(o,p);
      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(0);
    });

    it('does not recurse into complex objects', function() {
      function Nafn() {}

      var r,
      a = new Nafn(),
      b = new Nafn(),
      o = {q: a},
      p = {q: b};

      a.inner = true;
      b.inner = true;

      r = diff(o,p);
      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(1);
      expect(Object.keys(r).indexOf('q')).toBeGreaterThan(-1);
    });
  });

  return diff;

});
