define(['real/Controller', 'nbd/Class', 'nbd/View', 'nbd/Model'], function(Controller, Class, View, Model) {
  'use strict';

  describe('Controller', function() {
    var inst;

    beforeEach(function() {
      inst = new Controller();
    });

    it('is a class constructor', function() {
      expect(Controller).toEqual(jasmine.any(Function));
      expect(Controller.inherits(Class)).toBe(true);
      expect(inst).toEqual(jasmine.any(Controller));
    });

    describe('.init()', function() {
      it('creates the Model', function() {
        expect(inst._model).toEqual(jasmine.any(Model));
      });

      it('creates the View', function() {
        expect(inst._view).toBeDefined();
        expect(inst._view._controller).toBe(inst);
        expect(inst._view.id()).toBe(inst._model.id());
      });
    });


    describe('.destroy()', function() {
      it('is a function', function() {
        expect(inst.destroy).toEqual(jasmine.any(Function));
        expect(function() {
          inst.destroy();
        }).not.toThrow();
      });

      it('destroys associated view', function() {
        var spy = spyOn(inst._view, 'destroy');
        inst.destroy();
        expect(spy).toHaveBeenCalled();
      });

      it('destroys associated model', function() {
        var spy = spyOn(inst._model, 'destroy');
        inst.destroy();
        expect(spy).toHaveBeenCalled();
      });

      it('resets references', function() {
        inst.destroy();
        expect(inst._view).toEqual(null);
        expect(inst._model).toEqual(null);
      });

      it('fires destroy event', function() {
        var spy = jasmine.createSpy('destroy');
        inst.on('destroy', spy);
        inst.destroy();
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('._initView()', function() {
      var Klass = function() {};

      beforeEach(function() {
        inst._initView(Klass);
      });

      it('creates ._view', function() {
        expect(inst._view).toEqual(jasmine.any(Klass));
      });

      it('attaches the controller to the ._view', function() {
        expect(inst._view._controller).toBe(inst);
      });
    });

    describe('.switchView()', function() {
      var Klass = function() {};

      it('creates ._view if nonexistant', function() {
        inst.switchView(Klass);
        expect(inst._view).toEqual(jasmine.any(Klass));
      });

      it('replaces ._view if existing', function() {
        Klass.prototype.$view = 'Klass $view';
        Klass.prototype.destroy = jasmine.createSpy('view destroy');
        inst.switchView(Klass);

        var View = function() {};
        View.prototype.render = jasmine.createSpy('view render');
        inst.switchView(View);

        expect(inst._view).toEqual(jasmine.any(View));
        expect(inst._view.render).toHaveBeenCalled();
        expect(inst._view.$view).toBe(Klass.prototype.$view);
        expect(Klass.prototype.destroy).toHaveBeenCalled();
      });
    });

    describe('.render()', function() {
      it('calls View render', function() {
        var $parent = document.createElement('div');

        spyOn(inst._view, 'render');
        inst.render($parent);
        expect(inst._view.render).toHaveBeenCalledWith($parent);
      });

      it('renders with the specified View class', function() {
        var $parent = document.createElement('div'),
        NewViewClass = Controller.VIEW_CLASS.extend({});

        inst.render($parent, NewViewClass);
        expect(inst._view).toEqual(jasmine.any(NewViewClass));
      });

      it('returns promise of View render\'s return value', function(done) {
        var $parent = document.createElement('div'), retval = 'foobar';

        spyOn(inst._view, 'render').and.returnValue(retval);
        var output = inst.render($parent);
        expect(output).toEqual(jasmine.objectContaining({
          then: jasmine.any(Function)
        }));

        output.then(function(value) {
          expect(value).toBe('foobar');
          done();
        });
      });
    });

    describe('.toJSON()', function() {
      it('returns the model data', function() {
        spyOn(inst._model, 'toJSON').and.callThrough();

        var json = JSON.stringify(inst);
        expect(inst._model.toJSON).toHaveBeenCalled();
        expect(json).toEqual(JSON.stringify(inst._model));
      });
    });
  });

  return Controller;
});
