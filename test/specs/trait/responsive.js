define(['real/trait/responsive', 'nbd/util/media', 'nbd/Controller'], function(responsive, media, Controller) {
  'use strict';

  Controller = Controller.extend().mixin(responsive);
  describe('trait/responsive', function() {
    var instance;

    describe('.requestView()', function() {
      var View;

      beforeEach(function() {
        View = jasmine.createSpy('ViewClass');
      });

      it('binds to media', function() {
        Controller.VIEW_CLASS = {};
        instance = new Controller();
        spyOn(instance, 'requestView');

        media.trigger('test', true);
        expect(instance.requestView).toHaveBeenCalledWith('test');
      });

      it('expects non-matching views', function() {
        Controller.VIEW_CLASS = {};
        instance = new Controller();

        expect(instance._view).not.toBeDefined();
      });

      it('switches to the requested class', function() {
        instance = new Controller();
        instance.requestView(View);

        expect(instance._view).toEqual(jasmine.any(View));
        expect(View).toHaveBeenCalledWith(instance._model);
      });

      it('doesn\'t switch if already an instance', function() {
        Controller.VIEW_CLASS = View;
        instance = new Controller();

        expect(instance._view).toEqual(jasmine.any(View));
        instance.requestView(View);
        expect(View.calls.count()).toBe(1);
      });

      it('matches a breakpoint to a view class', function() {
        spyOn(media, 'getState').and.returnValue(['test']);
        Controller.VIEW_CLASS = { test: View };
        instance = new Controller();

        expect(instance._view).toEqual(jasmine.any(View));
        expect(View).toHaveBeenCalledWith(instance._model);
      });

      it('only matches the first matching breakpoint', function() {
        var Bar = jasmine.createSpy('Bar');
        spyOn(media, 'getState').and.returnValue(['bar', 'foo', 'baz']);
        Controller.VIEW_CLASS = {
          foo: View,
          baz: Bar
        };
        instance = new Controller();

        expect(instance._view).toEqual(jasmine.any(View));
      });

      it('expects non-classes', function() {
        spyOn(media, 'getState').and.returnValue(['test']);
        expect(function() {
          instance = new Controller();
          instance.requestView(true);
        }).not.toThrow();
      });

      it('expects non-matching view', function() {
        spyOn(media, 'getState').and.returnValue([]);
        instance = new Controller();
        delete instance._view;

        instance.requestView({});
        expect(instance._view).not.toBeDefined();
      });
    });

    describe('media driven behavior', function() {
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

      // Can no longer be guaranteed
      xit('doesn\'t accidentally instanciate a member method', function() {
        View.test = jasmine.createSpy('member');
        Controller.VIEW_CLASS = View;

        instance = new Controller();

        media.trigger('test', true);
        expect(View.test).not.toHaveBeenCalled();
      });
    });
  });

  return responsive;
});
