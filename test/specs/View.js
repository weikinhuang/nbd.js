/*global jasmine, describe, xdescribe, it, expect, spyOn, beforeEach */
define(['real/View', 'nbd/Class', 'jquery'], function(View, Class, $) {
  'use strict';

  describe('View', function() {

    var instance;

    beforeEach(function() {
      instance = new View();
    });

    it('is a Class constructor', function() {
      expect( View ).toEqual(jasmine.any(Function));
      expect( View.inherits( Class ) ).toBe(true);
    });

    describe('View.prototype.templateData', function() {
      it('returns an object', function() {
        expect( instance.templateData() ).toEqual(jasmine.any(Object)); 
      });
    });

    describe('View.prototype.render', function() {
      it('uses templateData when given no data', function() {
        spyOn( instance, 'templateData' );

        instance.render();

        expect( instance.templateData ).toHaveBeenCalled();
      });

      it('uses data when given', function() {
        var data = { rand: Math.random() };

        spyOn( instance, 'template' ).andCallThrough();
        spyOn( instance, 'templateData' );

        instance.render(data);

        expect( instance.templateData ).not.toHaveBeenCalled();
        expect( instance.template ).toHaveBeenCalledWith(data);
      });

      it('calls rendered() if any', function() {
        instance.rendered = function() {
          expect(this).toBe(instance);
        };
        spyOn( instance, 'rendered' ).andCallThrough();
        instance.render();
        expect( instance.rendered ).toHaveBeenCalled();
      });
    });


    describe('View.prototype.destroy', function() {
      it('destroys itself', function() {
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
