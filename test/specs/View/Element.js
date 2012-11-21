/*global jasmine, describe, it, expect, spyOn, beforeEach */
define(['real/View/Element', 'jquery', 'nbd/View'], function(Element, $, View) {
  'use strict';

  describe('View.Element', function() {
    var $parent, instance;

    beforeEach(function() {
      $parent = $('<div id="element-test"/>');
      instance = new Element($parent);
      instance.template = function(data) {
        return $("<span>Hello "+data.item+"</span>");
      };
    });

    it('should exist', function() {
      expect( Element ).toBeDefined();
      expect( instance ).toEqual(jasmine.any(View));
    });

    describe('View.Element.prototype.init', function() {
      it('should set the parent element', function() {
        expect( instance.$parent[0] ).toBe($parent[0]);
      });
    });

    describe('View.Element.prototype.render', function() {
      it('should render a template into the parent element', function() {
        instance.render({ item: "world"});
        expect( $parent.text() ).toEqual('Hello world');
      });

      it('should re-render even without a parent element', function() {
        instance.render({ item: "world"});
        instance.$parent = null;
        instance.render({ item: "dolly"});

        expect( instance.$parent ).toBeNull();
        expect( $parent.text() ).toEqual('Hello dolly');
      });
    });

  });

  return Element;

});
