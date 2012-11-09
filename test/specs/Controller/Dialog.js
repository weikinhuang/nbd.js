/*global jasmine, describe, it, expect, spyOn, loadFixtures */
describe('Dialog controller', function() {
  var Dialog = $.Core.Controller.Dialog;

  it('should exist', function() {
    expect( Dialog ).toBeDefined();
  });

  it('should have prototype methods', function() {
    expect( Dialog.prototype.init ).toBeDefined();
    expect( Dialog.prototype.destroy ).toBeDefined();
    expect( Dialog.prototype.render ).toBeDefined();
  });

  describe('Controller.Dialog.prototype.init', function() {

    it('should bind to an event', function() {

      Dialog.RENDER_EVENT = 'test.first';
      spyOn( Dialog.prototype, 'render' );

      var first = Math.random(), 
          instance = new Dialog();

      $.Core.Events.trigger( 'test.first', first );
      expect( Dialog.prototype.render ).toHaveBeenCalledWith( first );

    });

    it('should bind to all events', function() {

      Dialog.RENDER_EVENT = ['test.first', 'test.second', 'test.last'];
      spyOn( Dialog.prototype, 'render' );

      var first = Math.random(), 
          second = Math.random(),
          last = Math.random(),
          instance = new Dialog();

      $.Core.Events.trigger( 'test.first', first );
      expect( Dialog.prototype.render ).toHaveBeenCalledWith( first );

      $.Core.Events.trigger( 'test.second', second );
      expect( Dialog.prototype.render ).toHaveBeenCalledWith( second );

      $.Core.Events.trigger( 'test.last', last );
      expect( Dialog.prototype.render ).toHaveBeenCalledWith( last );
    });

  });

  describe('Controller.Dialog.prototype.destroy', function() {

    it('should destroy its view', function() {
      var view, instance = new Dialog();
      instance.View = { destroy : $.noop };
      spyOn( instance.View, 'destroy' );

      // need to save it off because destroy will remove it
      view = instance.View;

      instance.destroy();

      expect( view.destroy ).toHaveBeenCalled();
      expect( instance.View ).toBeNull();
    });

    it('should unbind all events', function() {
      Dialog.RENDER_EVENT = ['test.first', 'test.second', 'test.last'];
      spyOn( Dialog.prototype, 'render' );

      var first = Math.random(), 
          second = Math.random(),
          last = Math.random(),
          instance = new Dialog();

      instance.destroy();

      $.Core.Events.trigger( 'test.first', first );
      expect( Dialog.prototype.render ).not.toHaveBeenCalled();

      $.Core.Events.trigger( 'test.second', second );
      expect( Dialog.prototype.render ).not.toHaveBeenCalled();

      $.Core.Events.trigger( 'test.last', last );
      expect( Dialog.prototype.render ).not.toHaveBeenCalled();
    });

  });

  describe('Controller.Dialog.prototype.render', function() {

    it('should render the view', function() {
      loadFixtures('entity.html', 'popup.html');
      spyOn( Dialog, 'loadTemplate' ).andCallThrough();

      Dialog.VIEW_CLASS = $.Core.View.Dialog.extend({},{
        TEMPLATE_ID : 'entity-template'});

      var instance = new Dialog();
      instance.render();

      expect( Dialog.loadTemplate ).not.toHaveBeenCalled();
      expect( instance.View.Controller ).toBe( instance );
      expect( $(document.body) ).toContain( instance.View.$popup );

    });

    it('should load the template if it\'s not there', function() {
      spyOn( Dialog, 'loadTemplate' ).andCallThrough();

      var instance, ViewClass;

      Dialog.VIEW_CLASS = ViewClass = $.Core.View.Dialog.extend({},{
        TEMPLATE_ID : 'entity-template',
        TEMPLATE_URL : 'xxx'
      });

      expect( Dialog.VIEW_CLASS.templateScript(false) ).toBe(false);

      instance = new Dialog();
      instance.render();

      expect( Dialog.loadTemplate ).toHaveBeenCalledWith( ViewClass );
      expect( instance.blocking ).toBe(true);

      instance.render();
      expect( Dialog.loadTemplate.callCount ).toBe(1);
    });

  });

});
