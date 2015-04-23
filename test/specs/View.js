define(['real/View', 'nbd/Model', 'jquery'], function(View, Model, $) {
  'use strict';

  describe('View', function() {
    var instance;

    beforeEach(function() {
      instance = new View();
    });

    describe('.init()', function() {
      it('accepts a Model', function() {
        var id = Date.now(),
        model = new Model(id, {}),
        instance = new View(model);

        expect(instance.id).toBeDefined();
        expect(instance.id()).toBe(id);
        expect(instance._model).toBe(model);
      });

      it('accepts non-Models', function() {
        var id = Date.now(),
            instance;

        expect(function() {
          instance = new View(id);
        }).not.toThrow();

        expect(instance._model).toBe(id);
      });
    });

    describe('.templateData()', function() {
      it('returns an object', function() {
        expect(instance.templateData()).toEqual(jasmine.any(Object));
      });

      it('returns an object with the Model', function() {
        var model = new Model(0, {}),
        instance = new View(model);

        expect(instance.templateData()).toEqual(jasmine.any(Object));
        expect(instance.templateData()).toBe(model.data());
      });

      it('returns whatever was given, if not a Model', function() {
        var instance = new View('not a model');
        expect(instance.templateData()).toBe('not a model');
      });
    });

    describe('.render()', function() {
      var id, item, $test, model, instance;

      beforeEach(function() {
        id = Date.now();
        item = 'lorem ipsum';
        $test = $('<div id="entity-test"/>');
        model = new Model(id, {item: item});
        instance = new View(model);
        instance.template = function(data) {
          return $('<span>', {text: this.id() + " : " + data.item});
        };
      });

      it('replaces view if existing', function() {
        var replace = jasmine.createSpy('replaceWith');
        spyOn(instance, 'template').and.returnValue({ length: 1, replaceWith: replace, 1: null });

        instance.render();
        expect(replace).not.toHaveBeenCalled();
        expect(instance.template).toHaveBeenCalled();

        instance.render();
        expect(replace).toHaveBeenCalled();
      });

      it('calls rendered() if any', function() {
        instance.rendered = function() {
          expect(this).toBe(instance);
        };
        spyOn(instance, 'rendered').and.callThrough();
        instance.render();
        expect(instance.rendered).toHaveBeenCalled();
      });

      it('fires prerender event', function() {
        var prerender = jasmine.createSpy('prerender')
        .and.callFake(function() {
          expect(instance.template).not.toHaveBeenCalled();
        });
        spyOn(instance, 'template').and.callThrough();

        instance.on('prerender', prerender);
        instance.render();

        expect(prerender).toHaveBeenCalled();
      });

      it('fires postrender event', function() {
        var postrender = jasmine.createSpy('postrender')
        .and.callFake(function() {
          expect(instance.template).toHaveBeenCalled();
        });
        spyOn(instance, 'template').and.callThrough();

        instance.on('postrender', postrender);
        instance.render();

        expect(postrender).toHaveBeenCalledWith(instance.$view);
      });

      it('renders a template into the parent element', function() {
        instance.rendered = $.noop;
        spyOn(instance, 'rendered');
        spyOn(instance, 'templateData').and.callThrough();

        instance.render($test);

        expect($test.text()).toEqual(id + ' : ' + item);
        expect(instance.rendered).toHaveBeenCalled();
        expect(instance.templateData).toHaveBeenCalled();
      });

      it('re-renders without a parent element', function() {
        instance.rendered = $.noop;
        spyOn(instance, 'rendered');
        spyOn(instance, 'templateData').and.callThrough();

        instance.render($test);

        expect(instance.$view).toBeDefined();
        var shun = jasmine.createSpy();
        instance.$view.on('click', shun);

        model.set('item', item);
        instance.render();

        expect($test.text()).toEqual(id + ' : ' + item);
        expect(instance.rendered).toHaveBeenCalled();
        expect(instance.templateData).toHaveBeenCalled();

        instance.$view.trigger('click');
        expect(shun).not.toHaveBeenCalled();
      });

      it('renders when there\'s no parent and has not already been rendered', function() {
        instance.rendered = $.noop;
        spyOn(instance, 'rendered');
        spyOn(instance, 'templateData').and.callThrough();

        var $view = instance.render();

        expect($test.children().length).toBe(0);
        expect($view).not.toBeNull();
        expect(instance.rendered).toHaveBeenCalled();
        expect(instance.templateData).toHaveBeenCalled();
      });

      it('does not re-render, only reattach, when it has been rendered and there is a parent', function() {
        instance.rendered = $.noop;
        spyOn(instance, 'templateData').and.callThrough();
        instance.render($test);

        var shun = jasmine.createSpy('binding');
        instance.$view.on('click', shun);

        spyOn(instance, 'rendered');
        model.set('item', null);
        instance.render($test);

        expect($test.text()).toEqual(id + ' : ' + item);
        expect(instance.rendered).not.toHaveBeenCalled();
        expect(instance.templateData.calls.count()).toBe(1);

        instance.$view.trigger('click');
        expect(shun).toHaveBeenCalled();
        expect(shun.calls.count()).toBe(1);
      });

      it('can nest other views', function() {
        var subview = new View();
        spyOn(subview, 'render');

        instance.nests = {
          foo: null
        };
        model.set('foo', subview);
        expect(subview.render).not.toHaveBeenCalled();

        instance.render();

        expect(subview.render).toHaveBeenCalledWith(instance.$view);
      });

      it('can nest other views into a selector', function() {
        var subview = new View();
        spyOn(subview, 'render');

        var $v = $('<div><p>first</p><p class="bar">second</p></div>');
        instance.template = function() {
          return $v;
        };
        instance.nests = {
          foo: '.bar'
        };
        model.set('foo', subview);
        expect(subview.render).not.toHaveBeenCalled();

        instance.render();

        expect(subview.render).toHaveBeenCalledWith($v.find('.bar'));
      });

      it('can nest other views after having been rendered', function(done) {
        var subview = new View();
        spyOn(subview, 'render');

        instance.nests = {
          foo: 'span'
        };
        instance.render();

        model.set('foo', subview);
        setTimeout(function() {
          expect(subview.render).toHaveBeenCalled();
          done();
        }, 50);
      });
    });

    describe('.destroy()', function() {
      it('destroys itself', function() {
        var instance = new View();

        instance.template = function() {
          return $('<div id="mytest" />').appendTo(document.body);
        };

        instance.render();
        instance.destroy();
        expect($('#mytest').length).toBe(0);
        expect(instance.$view).toBe(null);
      });

      it('retains reference to its model', function() {
        var model = new Model(),
        instance = new View(model);

        instance.destroy();
        expect(instance._model).toBe(model);
      });
    });

    describe('View.domify()', function() {
      it('parses HTML', function() {
        var el = View.domify('<article></article>');

        expect(el).toEqual(jasmine.any(Element));
        expect(el.nodeName).toBe('ARTICLE');
      });
    });

    describe('View.appendTo()', function() {
      it('appends child to parent', function() {
        var child = document.createElement('li'),
        parent = document.createElement('ul');

        View.appendTo(child, parent);
        expect(child.parentNode).toBe(parent);
      });
    });

    describe('View.replace()', function() {
      it('replaces a child of a parent', function() {
        var child = document.createElement('li'),
        parent = document.createElement('ul'),
        usurper = document.createElement('li');

        parent.appendChild(child);
        View.replace(child, usurper);

        expect(child.parentNode).toBe(null);
        expect(usurper.parentNode).toBe(parent);
        expect(parent.childNodes.length).toBe(1);
        expect(parent.childNodes[0]).toBe(usurper);
      });
    });

    describe('View.remove()', function() {
      it('removes child from parent', function() {
        var child = document.createElement('li'),
        parent = document.createElement('ul');

        parent.appendChild(child);
        View.remove(child);

        expect(child.parentNode).toBe(null);
        expect(parent.childNodes.length).toBe(0);
      });
    });
  });

  return View;
});
