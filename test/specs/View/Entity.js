/*global jasmine, describe, it, expect, spyOn, beforeEach */
define(['real/View/Entity', 'jquery', 'nbd/View', 'nbd/Model'], function(Entity, $, View, Model) {
  'use strict';

  describe('View/Entity', function() {
    var instance;

    it('is a View constructor', function() {
      expect( Entity ).toEqual(jasmine.any(Function));
      expect( Entity.inherits(View) ).toBe(true);
    });

    describe('View.Entity.prototype.init', function() {

      it('accepts a Model', function() {
        var id = Date.now(),
        model = new Model( id, {} ),
        instance = new Entity(model);

        expect( instance.id ).toBeDefined();
        expect( instance.id() ).toBe(id);
        expect( instance.Model ).toBe( model );
      });

      it('accepts non-Models', function() {
        var id = Date.now(),
        instance = new Entity(id);

        expect( instance.id ).toBeDefined();
        expect( instance.id() ).toBe(id);
        expect( instance.Model ).not.toBeDefined();
      });

    });

    describe('View.Entity.prototype.templateData', function() {

      it('returns an object with the Model', function() {
        var model = new Model( 0, {} ),
        instance = new Entity(model);

        expect( instance.templateData ).toBeDefined();
        expect( instance.templateData() ).toEqual(jasmine.any(Object));
        expect( instance.templateData() ).toBe( model.data() );
      });

    });

    describe('View.Entity.prototype.render', function() {
      Entity.TEMPLATE_ID = 'entity-template';

      var id, item, $test, model, instance;

      beforeEach(function() {
        id = Date.now();
        item = 'lorem ipsum';
        $test = $('<div id="entity-test"/>');
        model = new Model( id, {item:item} );
        instance = new Entity(model);
        instance.template = function(data) {
          return $('<span>', {text:this.id()+" : "+data.item});
        };
      });

      it('renders a template into the parent element', function() {
        instance.rendered = $.noop;
        spyOn( instance, 'rendered' );
        spyOn( instance, 'templateData' ).andCallThrough();

        instance.render($test);

        expect( $test.text() ).toEqual(id+' : '+item);
        expect( instance.rendered ).toHaveBeenCalled();
        expect( instance.templateData ).toHaveBeenCalled();
      });

      it('re-renders without a parent element', function() {
        instance.rendered = $.noop;
        spyOn( instance, 'rendered' );
        spyOn( instance, 'templateData' ).andCallThrough();

        instance.render($test);

        model.set('item', item);
        instance.render();

        expect( $test.text() ).toEqual(id+' : '+item);
        expect( instance.rendered ).toHaveBeenCalled();
        expect( instance.templateData ).toHaveBeenCalled();
      });

      it('does not render when there\'s no parent and has not already been rendered', function() {
        instance.rendered = $.noop;
        spyOn( instance, 'rendered' );
        spyOn( instance, 'templateData' ).andCallThrough();

        instance.render();

        expect( $test ).toBeEmpty();
        expect( instance.rendered ).not.toHaveBeenCalled();
        expect( instance.templateData ).not.toHaveBeenCalled();
      });

      it('does not re-render, only reattach, when it has been rendered and there is a parent', function() {
        instance.rendered = $.noop;
        spyOn( instance, 'templateData' ).andCallThrough();
        instance.render($test);

        spyOn( instance, 'rendered' );
        model.set('item', null);
        instance.render($test);

        expect( $test.text() ).toEqual(id+' : '+item);
        expect( instance.rendered ).not.toHaveBeenCalled();
        expect( instance.templateData.callCount ).toBe(1);
      });

      it('always renders when it has been pre-templated', function() {
        instance.rendered = $.noop;
        spyOn( instance, 'rendered' );
        spyOn( instance, 'templateData' ).andCallThrough();
        instance.$view = '<span>Hello world</span>';

        instance.render($test);

        expect( $test.text() ).toEqual('Hello world');
        expect( instance.rendered ).toHaveBeenCalled();
        expect( instance.templateData ).not.toHaveBeenCalled();
      });

      it('does nothing when it was pre-templated but there\'s no parent', function() {
        instance.rendered = $.noop;
        spyOn( instance, 'rendered' );
        spyOn( instance, 'templateData' ).andCallThrough();
        instance.$view = '<span>Hello world</span>';

        instance.render();

        expect( $test ).toBeEmpty();
        expect( instance.rendered ).not.toHaveBeenCalled();
        expect( instance.templateData ).not.toHaveBeenCalled();
      });
    });
  });
  
  return Entity;
});
