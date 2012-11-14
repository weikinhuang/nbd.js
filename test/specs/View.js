/*global jasmine, describe, it, expect, spyOn, loadFixtures */
define(['nbd/View', 'Class', 'jquery'], function(View, Class, $) {
  'use strict';

  describe('View', function() {

    it('should exist', function() {
      expect( View ).toBeDefined();
    });

    it('should extend Class', function() {
      expect( View.inherits( Class ) ).toBe(true);
    });

    it('should have prototype methods', function() {
      var instance = new View();
      expect( instance.init ).toBeDefined();
      expect( instance.templateScript ).toBeDefined();
      expect( instance.destroy ).toBeDefined();
    });

    it('should have static methods', function() {
      expect( View.templateScript ).toBeDefined();
    });

    describe('View.templateScript', function() {

      it('should try to find the class template', function() {
        expect(function(){ View.templateScript(); }).toThrow();
        expect( View.templateScript(false) ).toBe(false);

        // loads <div id="mytest">Hello</div>
        loadFixtures('test.html');
        View.TEMPLATE_ID = "mytest";
        expect( View.templateScript(false) ).not.toBe(false);
        expect( View.templateScript().html() ).toEqual('Hello');
      });

    });

    describe('View.prototype.templateScript', function() {

      it('should find the class template from an instance', function() {
        var instance = new View();

        spyOn( View, 'templateScript' );
        instance.templateScript();
        expect( View.templateScript ).toHaveBeenCalled();
      });

    });

    describe('View.prototype.destroy', function() {

      it('should destroy itself', function() {
        var instance = new View();
        instance.$view = instance.templateScript();
        instance.destroy();
        expect( $('#mytest').length ).toBe(0);
        expect( instance.$view ).toBe(null);
      });

    });

  });

  return View;
});
