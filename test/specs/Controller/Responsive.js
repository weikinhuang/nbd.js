define(['real/Controller/Responsive', 'nbd/util/media'], function(Responsive, media) {
  'use strict';

  describe('Controller/Responsive', function() {
    var Controller;

    it('is a Controller constructor', function() {
      expect(Responsive).toEqual(jasmine.any(Function));
    });

    beforeEach(function() {
      Controller = Responsive.extend();
    });

    describe('.init()', function() {
      var instance;

      beforeEach(function() {
        instance = new Controller();
      });

      it('creates the Model', function() {
        expect(instance._model).toBeDefined();
      });

      it('creates the View', function() {
        expect(instance._view).toBeDefined();
        expect(instance._view._controller).toBe(instance);
      });

      it('binds to media', function() {
        spyOn(Controller.prototype, 'mediaView');
        instance = new Controller();

        media.trigger('test', 'foobar');
        expect(instance.mediaView).toHaveBeenCalledWith('test', 'foobar');
      });

      it('expects non-matching views', function() {
        Controller.VIEW_CLASS = {};
        instance = new Controller();

        expect(instance._view).not.toBeDefined();
      });
    });

    describe('.destroy()', function() {
      var instance;
      it('removes media binding', function() {
        spyOn(Controller.prototype, 'mediaView');
        instance = new Controller();

        instance.destroy();
        media.trigger('test', 'foobar');
        expect(instance.mediaView).not.toHaveBeenCalled();
      });

      it('expects non-matching views', function() {
        Controller.VIEW_CLASS = {};
        instance = new Controller();

        expect(function() {
          instance.destroy();
        }).not.toThrow();
      });
    });

    describe('.render', function() {
      var instance;
      beforeEach(function() {
        instance = new Controller();
      });

      it('is a straight pass-through to the view', function() {
        spyOn(instance._view, 'render');

        instance.render('foo', 'bar', 'baz', 'baroque');
        expect(instance._view.render).toHaveBeenCalledWith('foo', 'bar', 'baz', 'baroque');
      });

      it('expects non-matching view', function() {
        Controller.VIEW_CLASS = {};
        instance = new Controller();

        expect(function() {
          instance.render();
        }).not.toThrow();
      });
    });

    describe('.requestView', function() {
      var View, instance;

      beforeEach(function() {
        View = jasmine.createSpy('ViewClass');
        instance = new Controller();
      });

      it('switches to the requested class', function() {
        instance.requestView(View);

        expect(instance._view).toEqual(jasmine.any(View));
        expect(View).toHaveBeenCalledWith(instance._model);
      });

      it('doesn\'t switch if already an instance', function() {
        Controller.VIEW_CLASS = View;
        instance = new Controller();

        expect(instance._view).toEqual(jasmine.any(View));
        instance.requestView(View);
        expect(View.callCount).toBe(1);
      });

      it('matches a breakpoint to a view class', function() {
        spyOn(media, 'getState').andCallFake(function() {
          return ['test'];
        });
        instance.requestView({ test: View });

        expect(instance._view).toEqual(jasmine.any(View));
        expect(View).toHaveBeenCalledWith(instance._model);
      });

      it('only matches the first matching breakpoint', function() {
        var Bar = jasmine.createSpy('Bar');
        spyOn(media, 'getState').andCallFake(function() {
          return ['bar', 'foo', 'baz'];
        });
        instance.requestView({
          foo: View,
          baz: Bar
        });

        expect(instance._view).toEqual(jasmine.any(View));
      });

      it('expects non-classes', function() {
        spyOn(media, 'getState').andCallFake(function() {
          return ['test'];
        });
        expect(function() {
          instance.requestView(true);
        }).not.toThrow();
      });

      it('expects non-matching view', function() {
        spyOn(media, 'getState').andCallFake(Array);
        delete instance._view;

        instance.requestView({});
        expect(instance._view).not.toBeDefined();
      });
    });

    describe('.mediaView', function() {
      var instance, View;

      beforeEach(function() {
        View = jasmine.createSpy('ViewClass');
      });

      it('switches views when entering a breakpoint', function() {
        var View = jasmine.createSpy('ViewClass');
        Controller.VIEW_CLASS = {
          test: View
        };

        instance = new Controller();

        media.trigger('test', true);
        expect(instance._view).toEqual(jasmine.any(View));
      });

      it('does nothing when exiting a breakpoint', function() {
        Controller.VIEW_CLASS = {
          test: View
        };

        instance = new Controller();

        media.trigger('test', false);
        expect(instance._view).not.toEqual(jasmine.any(View));
      });

      it('doesn\'t accidentally instanciate a member method', function() {
        View.test = jasmine.createSpy('member');
        Controller.VIEW_CLASS = View;

        instance = new Controller();

        media.trigger('test', true);
        expect(View.test).not.toHaveBeenCalled();
      });
    });
  });

  return Responsive;
});
