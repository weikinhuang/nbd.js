/*global jasmine, describe, it, expect, spyOn, beforeEach */
define(['real/util/protochain'], function(protochain) {
  'use strict';

  describe('util/protochain', function() {
    var Usurper, Superclass, Subclass;

    beforeEach(function() {
      Usurper = function () {};
      Superclass = function () {};
      Subclass = function () {};

      Subclass.prototype = new Superclass();
      Subclass.prototype.constructor = Subclass;
    });

    it('should exist', function() {
      expect( protochain ).toBeDefined();
      expect( protochain ).toEqual(jasmine.any(Function));
    });

    it('should append to the prototype chain', function() {
      var instance = new Subclass(),
      pCheck;
      expect(instance).not.toEqual(jasmine.any(Usurper));

      pCheck = expect(function() {
        protochain(Subclass, Usurper);
      });
      ('__proto__' in Subclass.prototype ? pCheck.not : pCheck ).toThrow();

      expect(instance.constructor).toBe(Subclass);
      expect(instance).toEqual(jasmine.any(Superclass));
      expect(instance).toEqual(jasmine.any(Usurper));
    });

    it('should append to the prototype chain when forced', function() {
      Object.preventExtensions(Superclass.prototype);

      var instance = new Subclass();
      expect(function() {
        protochain(Subclass, Usurper);
      }).toThrow();

      // Extension is prevented, replace the entire prototype chain
      protochain(Subclass, Usurper, true);
      // Existing instances not affected
      expect(instance).not.toEqual(jasmine.any(Usurper));
      // New instances affected
      instance = new Subclass();
      expect(instance.constructor).toBe(Subclass);
      expect(instance).toEqual(jasmine.any(Superclass));
      expect(instance).toEqual(jasmine.any(Usurper));
    });

  });

  return protochain;

});
