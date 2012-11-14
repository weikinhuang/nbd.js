/*global jasmine, describe, it, expect, spyOn, loadFixtures */
define(['jquery', 'nbd/Controller/Entity', 'Controller', 'View/Entity', 'Model'], function($, Entity, Controller, View, Model) {
  'use strict';

  describe('Entity controller', function() {

    it('should exist', function() {
      expect( Entity ).toBeDefined();
    });

    it('should extend Controller', function() {
      expect( Entity ).toEqual(jasmine.any(Controller));
    });

    Entity.MODEL_CLASS = Model;
    Entity.VIEW_CLASS = View;

    describe('Entity.prototype.init', function() {

      it('should create the Model', function() {
        var instance = new Entity(0,{});
        expect( instance.Model ).toBeDefined();
      });

      it('should create the View', function() {
        var instance = new Entity(0,{});

        expect( instance.View ).toBeDefined();
        expect( instance.View.Controller ).toBe( instance );
        expect( instance.Model.id() ).toBe( instance.View.id() );

      });

    });

    describe('Entity.prototype.render', function() {

      it('should call View render', function() {
        var $parent = $(),
        instance = new Entity(0,{});

        spyOn( instance.View, 'render' );
        instance.render( $parent );
        expect( instance.View.render ).toHaveBeenCalledWith( $parent );
      });

      it('should render with the specified View class', function() {
        var $parent = $(),
        NewViewClass = Entity.VIEW_CLASS.extend({});
        instance = new Entity(0,{});

        instance.render( $parent, NewViewClass );
        expect( instance.View ).toBeInstanceOf( NewViewClass );
      });

    });

    describe('Entity.prototype.update', function() {
      it('should call View update', function() {
        var instance = new Entity(0,{});

        spyOn( instance.View, 'update' );
        instance.update();
        expect( instance.View.update ).toHaveBeenCalled();
      });
    });

    describe('Entity.prototype.fix', function() {
      it('should call View fix', function() {
        var instance = new Entity(0,{});

        spyOn( instance.View, 'fix' );
        instance.fix();
        expect( instance.View.fix ).toHaveBeenCalled();
      });
    });

  });
});
