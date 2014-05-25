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
      r = diff(o, p);

      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(0);
    });

    it('returns an array of differences', function() {
      var o, p, r;

      o = {simple: "foobar"};
      p = {simple: "foobaz"};
      r = diff(o, p);

      expect(r.simple).toBeDefined();
      expect(r.simple[0]).toBe("foobar");
      expect(r.simple[1]).toBe("foobaz");
    });

    it('minimizes object differences', function() {
      var o, p, r;

      o = {simple: {}};
      p = {simple: {}};
      r = diff(o, p);

      expect(Object.keys(r).length).toBe(0);
    });

    it('finds unequal keys', function() {
      var o, p, r;

      o = {simple: {}};
      p = {};
      r = diff(o, p);

      expect(r.simple).toBeDefined();
      expect(r.simple[0]).toBeDefined();
      expect(r.simple[1]).not.toBeDefined();
    });

    it('finds unequal keys in the opposite direction', function() {
      var o, p, r;

      o = {};
      p = {simple: {}};
      r = diff(o, p);

      expect(r.simple).toBeDefined();
      expect(r.simple[0]).not.toBeDefined();
      expect(r.simple[1]).toBeDefined();
    });

    it('does not find unmodified arrays', function() {
      var o, p, r;

      o = {simple: [0]};
      p = {simple: [0]};
      r = diff(o, p);
      expect(r.simple).not.toBeDefined();
    });

    it('finds modified arrays', function() {
      var o, p, r;

      o = {simple: [0]};
      p = {simple: [1]};
      r = diff(o, p);

      expect(r.simple).toBeDefined();
    });

    it('calls a callback for every difference', function() {
      var o, p, r, cb = jasmine.createSpy('diffspy');

      o = {
        unchanged: 10,
        simple: "foobar",
        complex: {
          meaning: 42
        }
      };
      p = {
        unchanged: 10,
        simple: "foobaz",
        complex: {
          meaning: '42'
        },
        extra: 'credit'
      };
      r = diff(o, p, cb);

      expect(cb).toHaveBeenCalledWith('simple', 'foobar', 'foobaz');
      expect(cb).toHaveBeenCalledWith('complex', o.complex, p.complex);
      expect(cb).toHaveBeenCalledWith('extra', undefined, 'credit');
      expect(cb.calls.count()).toBe(3);
    });

    it('does not infinitely recurse', function() {
      var r,
      o = {},
      p = {};

      o.self = o;
      p.self = o;
      r = diff(o, p);
      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(0);
    });

    it('does not recurse into complex objects', function() {
      function Ctor() {}

      var r,
      a = new Ctor(),
      b = new Ctor(),
      o = {q: a},
      p = {q: b};

      a.inner = true;
      b.inner = true;

      r = diff(o, p);
      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(1);
      expect(Object.keys(r).indexOf('q')).toBeGreaterThan(-1);
    });

    it('does not object check null', function() {
      var o, p, r;

      o = {simple: null};
      p = {simple: {}};
      r = diff(o, p);

      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(1);

      r = diff(p, o);

      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(1);

      o = {simple: null};
      p = {simple: null};
      r = diff(o, p);

      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(0);

      p = {simple: undefined};
      r = diff(o, p);

      expect(r).toEqual(jasmine.any(Object));
      expect(Object.keys(r).length).toBe(1);
    });

    it('deep checks objects with self-references', function() {
      var o, p, r,
      same1 = {
        foo: 'baz'
      },
      same2 = {
        foo: 'baz'
      };

      same1.different = same1;
      same2.different = same2;

      o = {complex: {
        first: {
          foo: 'bar',
          different: same1
        }
      }};
      p = {complex: {
        first: {
          foo: 'bar',
          different: same2
        }
      }};
      r = diff(o, p);

      expect(Object.keys(r).length).toBe(0);
    });

    it('does not check non-objects', function() {
      expect(function() {
        diff(1, null);
      }).toThrow();

      expect(function() {
        diff(/\./, {});
      }).toThrow();

      expect(function() {
        diff(undefined, true);
      }).toThrow();
    });
  });

  return diff;
});
