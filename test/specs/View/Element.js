/*global jasmine, describe, it, expect, spyOn, loadFixtures */
describe('View.Element', function() {
  var Element = $.Core.View.Element;

  it('should exist', function() {
    expect( Element ).toBeDefined();
    expect( Element.inherits( $.Core.View ) ).toBe(true);
    expect( Element.prototype.init ).not.toBe( $.Core.View.prototype.init );
    expect( Element.prototype.render ).not.toBe( $.Core.View.prototype.render );
  });

  describe('View.Element.prototype.init', function() {

    it('should set the parent element', function() {
      loadFixtures('element.html');

      var $test = $('#element-test'),
          instance = new Element($test);

      expect( instance.$parent ).toBeDefined();
      expect( instance.$parent ).not.toBeNull();
      expect( instance.$parent.length ).not.toBe(0);
      expect( instance.$parent[0] ).toBe($test[0]);
    });

  });

  describe('View.Element.prototype.render', function() {

    Element.TEMPLATE_ID = 'element-template';

    it('should render a template into the parent element', function() {
      loadFixtures('element.html');

      var $test = $('#element-test'),
          instance = new Element( $test );
      
      instance.render({ item: "world"});

      expect( $test.html() ).toEqual('Hello world');
    });

    it('should not render without a parent element', function() {
      loadFixtures('element.html');

      var instance = new Element();
      
      expect(Element.PARENT_ID).not.toBeDefined();
      expect(function(){ instance.render({ item: "world"}); }).toThrow();
    });

    it('should re-render even without a parent element', function() {
      loadFixtures('element.html');

      var $test = $('#element-test'),
          instance = new Element( $test );
      
      instance.render({ item: "world"});
      instance.$parent = null;
      instance.render({ item: "dolly"});

      expect( instance.$parent ).toBeNull();
      expect( $test.html() ).toEqual('Hello dolly');
    });

    it('should render when the parent is delay-selected', function() {
      loadFixtures('element.html');

      var instance = new Element();
      Element.PARENT_ID = 'nonexistant';
      instance.PARENT_ID = 'element-test';
      
      expect(Element.PARENT_ID).toBeDefined();
      expect(instance.PARENT_ID).toBeDefined();
      expect(function(){ instance.render({ item: "nurse"}); }).not.toThrow();
      expect( $('#'+instance.PARENT_ID).html() ).toEqual('Hello nurse');
    });

  });

});
