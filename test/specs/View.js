/*global jasmine, describe, xdescribe, it, expect, spyOn, beforeEach */
define(['nbd/View', 'Class', 'jquery'], function(View, Class, $) {
  'use strict';

  describe('View', function() {

    var instance;

    beforeEach(function() {
      instance = new View();
    });

    it('should exist', function() {
      expect( View ).toBeDefined();
    });

    it('should extend Class', function() {
      expect( View.inherits( Class ) ).toBe(true);
    });

    it('should have prototype methods', function() {
      expect( instance.render ).toEqual(jasmine.any(Function));
      expect( instance.template ).toEqual(jasmine.any(Function));
      expect( instance.templateData ).toEqual(jasmine.any(Function));
      expect( instance.destroy ).toEqual(jasmine.any(Function));
    });

    describe('View.prototype.templateData', function() {
      it('should return an object', function() {
        expect( instance.templateData() ).toEqual(jasmine.any(Object)); 
      });
    });

    describe('View.prototype.render', function() {
      it('should use templateData when given no data', function() {
        spyOn( instance, 'templateData' );

        instance.render();

        expect( instance.templateData ).toHaveBeenCalled();
      });

      it('should use data when given', function() {
        var data = { rand: Math.random() };

        spyOn( instance, 'template' ).andCallThrough();
        spyOn( instance, 'templateData' );

        instance.render(data);

        expect( instance.templateData ).not.toHaveBeenCalled();
        expect( instance.template ).toHaveBeenCalledWith(data);
      });

      it('should call rendered() if any', function() {
        instance.rendered = function() {
          expect(this).toBe(instance);
        };
        spyOn( instance, 'rendered' ).andCallThrough();
        instance.render();
        expect( instance.rendered ).toHaveBeenCalled();
      });
    });

    xdescribe('View.templateScript', function() {
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

    xdescribe('View.prototype.templateScript', function() {
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

        instance.template = function() {
          return $('<div id="mytest" />').appendTo(document.body);
        };

        instance.render();
        instance.destroy();
        expect( $('#mytest').length ).toBe(0);
        expect( instance.$view ).toBe(null);
      });
    });
  });

  return View;
});
