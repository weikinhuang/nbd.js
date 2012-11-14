/*global jasmine, describe, it, expect, spyOn */
define(['nbd/Model', 'Class'], function(Model, Class) {
  'use strict';

  describe('Model', function() {

    it('should exist', function() {
      expect( Model ).toBeDefined();
    });

    it('should extend Class', function() {
      expect( Model.inherits( Class ) ).toBe(true);
    });

    describe('Model.prototype.init', function() {

      it('should initialize with data', function() {
        var rand = Math.random(), 
        instance = new Model( 1, {xyz:rand}),
        data;

        expect( instance.id() ).toBe(1);
        expect( data = instance.data() ).toEqual(jasmine.any(Object));
        expect( data.xyz ).toBe(rand);
      });

      it('should support non-numeric keys', function() {
        var instance = new Model( "xyz", {});
        expect( instance.id() ).toBe('xyz');

        instance = new Model( -1, {});
        expect( instance.id() ).toBe(-1);
      });

    });

    describe('Model.prototype.get', function() {

      it('should get a value', function() {
        var rand = Math.random(), instance = new Model( 1, {xyz:rand});
        expect( instance.get('xyz') ).toBe(rand);
      });

      it('should expect unepxected property names', function() {
        var instance = new Model( 1, {xyz:'xyz'});
        expect(function(){ instance.get('abc'); }).toThrow();
        expect(function(){ instance.get('abc',false); }).not.toThrow();
      });

      it('should get undefined values', function() {
        var instance = new Model( 1, {xyz:undefined});
        expect( instance.get('xyz') ).toBe(undefined);
      });

    });

    describe('Model.prototype.set', function() {
      var rand = Math.random(), instance = new Model( 1, {xyz:null});

      it('should accept an object map', function() {
        expect(function(){ instance.set({xyz:0}); }).not.toThrow();
        expect( instance.get('xyz') ).toBe(0);
        expect(function(){ instance.set({unknown:1}); }).toThrow();
      });

      it('should accept a key/value pair', function() {
        expect(function(){ instance.set('xyz', rand); }).not.toThrow();
        expect( instance.get('xyz') ).toBe(rand);
      });

    });

  });

  return Model;

});
