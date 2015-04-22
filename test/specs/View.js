define(['real/View', 'nbd/Class', 'jquery'], function(View, Class, $) {
  'use strict';

  describe('View', function() {
    var instance;

    beforeEach(function() {
      instance = new View();
    });

    it('is a Class constructor', function() {
      expect(View).toEqual(jasmine.any(Function));
      expect(View.inherits(Class)).toBe(true);
    });

    describe('.templateData()', function() {
      it('returns an object', function() {
        expect(instance.templateData()).toEqual(jasmine.any(Object));
      });
    });

    describe('.render()', function() {
      it('uses templateData when given no data', function() {
        spyOn(instance, 'templateData');

        instance.render();

        expect(instance.templateData).toHaveBeenCalled();
      });

      xit('uses data when given', function() {
        var data = { rand: Math.random() };

        spyOn(instance, 'template').and.callThrough();
        spyOn(instance, 'templateData');

        instance.render(data);

        expect(instance.templateData).not.toHaveBeenCalled();
        expect(instance.template).toHaveBeenCalledWith(data);
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
