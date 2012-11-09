/*global jasmine, describe, it, expect, spyOn, loadFixtures */
describe('View.Dialog', function() {
  var Dialog = $.Core.View.Dialog;

  it('should exist', function() {
    expect( Dialog ).toBeDefined();
  });

  it('should extend View', function() {
    expect( Dialog.inherits( $.Core.View ) ).toBe(true);
  });

  describe('View.Dialog.prototype.render', function() {
    var instance = new Dialog();

    it('should create a popup', function() {
      loadFixtures('popup.html');
      instance.render();
      expect( $(document.body) ).toContain( instance.$view );
    });

    it('should call rendered with a form', function() {
      loadFixtures('popup.html');

      instance.rendered = $.noop;
      spyOn( instance, 'rendered' );

      instance.render();
      expect( instance.rendered ).toHaveBeenCalled();
      expect( instance.rendered.mostRecentCall.args[0] ).toBe('form');
    });

  });

  describe('View.Dialog.prototype.destroy', function() {
    it('should selectively call the destroy implementation', function() {
      var instance = new Dialog();
      spyOn( instance, '_destroy' );

      instance.destroy( null, false );
      expect( instance._destroy ).not.toHaveBeenCalled();

      instance.destroy();
      expect( instance._destroy ).toHaveBeenCalled();
    });
  });

  describe('View.Dialog.prototype._destroy', function() {
    var instance = new Dialog();

    it('shouldn\'t do anything when not rendered', function() {
      spyOn( $.Core.Events, 'trigger' );
      instance._destroy();
      expect( $.Core.Events.trigger ).not.toHaveBeenCalled();
    });

    it('should close the popup', function() {
      loadFixtures('popup.html');
      instance.render();

      var $orig = instance.$view;
      expect( $(document.body) ).toContain( $orig );
      instance._destroy();
      expect( $(document.body) ).not.toContain( $orig );
      expect( instance.$view ).toBeNull();
    });

  });

  describe('close button', function() {
    it('should close the popup', function() {
      loadFixtures('popup.html');
      var instance = new Dialog(), $orig;
      instance.render();
      $orig = instance.$view;

      $('#popup-force-close').click();

      expect( $(document.body) ).not.toContain( $orig );
      expect( instance.$view ).toBeNull();
    });
  });

});
