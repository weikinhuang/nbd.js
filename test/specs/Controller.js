/*global jasmine, describe, it, expect, spyOn, mostRecentAjaxRequest */
describe('Controller', function() {
  var Controller = $.Core.Controller;

  it('should exist', function() {
    expect( $.Core.Controller ).toBeDefined();
  });

  it('should extend Class', function() {
    expect( Controller.inherits( $.Core.Class ) ).toBe(true);
  });

  it('should have prototype methods', function() {
    var instance = new Controller();

    expect( instance.init ).toBeDefined();
    expect( instance.render ).toBeDefined();
    expect( instance.destroy ).toBeDefined();
  });

  it('should have static methods', function() {
    expect( Controller.addTemplate ).toBeDefined();
    expect( Controller.loadTemplate ).toBeDefined();
  });

  describe('Controller.addTemplate', function() {
    var tmpl = Controller.addTemplate( 'test-template', "Hello world" );

    it('should add the test-template', function() {
      expect( tmpl.html() ).toEqual('Hello world');
    });

    it('should have loaded with given id', function() {
      expect( $('#test-template')[0] ).toBe( tmpl[0] );
    });

  });

  describe('Controller.loadTemplate', function() {
    var tmpl = 'load-test-template',
        spies = { template:function(){} },
        View = $.Core.View.extend({},{ TEMPLATE_ID : tmpl }),
        now = Date.now(),
        templateResponse = {
          status : 200,
          responseText : $.toJSON({ html : now })
        },
        promise;

    it('can load templates', function() {
      expect(function(){ Controller.loadTemplate( View ); }).toThrow("No template found");

      jasmine.Ajax.useMock();
      spyOn( spies, 'template' );
      View.TEMPLATE_URL = "xxx";

      promise = Controller.loadTemplate( View, spies.template )
        .done(function() {
          expect( spies.template ).toHaveBeenCalledWith(tmpl);
          expect( View.templateScript(false) ).not.toBe(false);
          expect( +View.templateScript(false).html() ).toEqual(now);
        });

      expect( promise.promise ).toBeDefined();

      mostRecentAjaxRequest().response( templateResponse );
    });
  });

});

