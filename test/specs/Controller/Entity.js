/*global jasmine, describe, it, expect, spyOn, beforeEach */
define(['jquery', 'real/Controller/Entity', 'nbd/Controller', 'nbd/View/Entity', 'nbd/Model'], function($, Entity, Controller, View, Model) {
  'use strict';

  describe('Controller/Entity', function() {

    var instance;

    it('is a Controller constructor', function() {
      expect(Entity).toEqual(jasmine.any(Function));
      expect(Entity.inherits(Controller)).toBe(true);
    });

    beforeEach(function() {
      Entity.MODEL_CLASS = Model;
      Entity.VIEW_CLASS = View;

      instance = new Entity(0,{});
    });

    describe('.init()', function() {
      it('creates the Model', function() {
        expect(instance._model).toEqual(jasmine.any(Model));
      });

      it('creates the View', function() {
        expect(instance._view).toBeDefined();
        expect(instance._view._controller).toBe(instance);
        expect(instance._view.id()).toBe(instance._model.id());

      });
    });

    describe('.render()', function() {
      it('calls View render', function() {
        var $parent = $();

        spyOn(instance._view, 'render');
        instance.render($parent);
        expect(instance._view.render).toHaveBeenCalledWith($parent);
      });

      it('renders with the specified View class', function() {
        var $parent = $(),
        NewViewClass = Entity.VIEW_CLASS.extend({});

        instance.render($parent, NewViewClass);
        expect(instance._view).toEqual(jasmine.any(NewViewClass));
      });
    });

    describe('.toJSON()', function() {
      it('returns the model data', function() {
        spyOn(instance._model, 'toJSON').andCallThrough();

        var json = JSON.stringify(instance);
        expect(instance._model.toJSON).toHaveBeenCalled();
        expect(json).toEqual(JSON.stringify(instance._model));
      });
    });

    describe('.destroy()', function() {
      it('destroys associated view', function() {
        var spy = spyOn(instance._view, 'destroy');
        instance.destroy();
        expect(spy).toHaveBeenCalled();
      });

      it('destroys associated model', function() {
        var spy = spyOn(instance._model, 'destroy');
        instance.destroy();
        expect(spy).toHaveBeenCalled();
      });

      it('resets references', function() {
        instance.destroy();
        expect(instance._view).toEqual();
        expect(instance._model).toEqual();
      });
    });
  });

  return Entity;
});
