/*global jasmine, describe, it, expect, spyOn */
define(['real/Class'], function(Class) {
  'use strict';

  describe('Class', function() {

    it('should exist', function() {
      expect( Class ).toBeDefined();
      expect( Class ).toEqual(jasmine.any(Function));
    });

    describe('Class.extend', function() {

      it('should create subclasses', function() {
        var Subclass = Class.extend({});
        expect( Subclass.__super__ ).toBe( Class.prototype );
        expect( Subclass.prototype.constructor ).toBe( Subclass );
        expect( new Subclass() ).toEqual( jasmine.any(Subclass) );
        expect( new Subclass() ).toEqual( jasmine.any(Class) );
      });

      it('should inherit from prototype', function() {
        var rand = Math.random(), Subclass = Class.extend({xyz:rand});
        expect( (new Subclass()).xyz ).toEqual(rand);
      });

      it('should inherit from static', function() {
        var rand = Math.random(), Subclass = Class.extend({},{xyz:rand});
        expect( Subclass.xyz ).toEqual(rand);
      });

      it('should call up the init chain by default', function() {
        var superproto = {init:function(){}},
        subproto = {init:function(){}},
        Superclass, Subclass;

        spyOn( superproto, 'init' );
        spyOn( subproto, 'init' );
        Superclass = Class.extend(superproto);
        Subclass = Superclass.extend(subproto);

        expect( new Subclass() ).toEqual(jasmine.any(Class));
        expect( superproto.init ).toHaveBeenCalled();
        expect( subproto.init ).toHaveBeenCalled();
      });

      it('should be able to not call up the init chain', function() {
        var superproto = {init:function(){}},
        subproto = {init:function(){}},
        Superclass, Subclass;

        spyOn( superproto, 'init' );
        spyOn( subproto, 'init' );
        Superclass = Class.extend(superproto);
        Subclass = Superclass.extend(subproto, {_:true});

        expect( new Subclass() ).toEqual(jasmine.any(Class));
        expect( superproto.init ).not.toHaveBeenCalled();
        expect( subproto.init ).toHaveBeenCalled();
      });

      it('can call its super implementation', function(){
        var superproto = {impl:function(){}},
        subproto = {impl:function(){this._super('z');}, _super:function(){}},
        Superclass, Subclass, instance;

        spyOn( superproto, 'impl' );
        spyOn( subproto, '_super' );
        Superclass = Class.extend(superproto);
        Subclass = Superclass.extend(subproto);

        instance = new Subclass();
        instance.impl();

        expect(superproto.impl).toHaveBeenCalledWith('z');
        expect(subproto._super).not.toHaveBeenCalled();
      });

    });

    describe('Class.mixin', function() {
      var Klass = Class.extend(),
      kInstance = new Klass();

      it('should add object properties into a prototype', function() {
        Klass.mixin({ bigDeal: 'no' });
        expect( Klass.prototype.bigDeal ).toBe('no');
      });

      it('should not add prototype properties into a prototype', function() {
        var A = Class.extend({protoprop:true});
        Klass.mixin(new A());
        expect( Klass.prototype.protoprop ).not.toBeDefined();
      });

      it('should provide to new instances', function() {
        expect( new Klass().bigDeal ).toBe('no');
      });

      it('should provide to existing instances', function() {
        expect( kInstance.bigDeal ).toBe('no');
      });

      it('should provide to subclasses', function() {
        var Qlass = Klass.extend();
        expect( new Qlass().bigDeal ).toBe('no');
      });
    });

    describe('Class.inherits', function() {

      it('should be able to check its ancestor', function() {
        var A = Class.extend({}), B = A.extend({}), C = Class.extend({});
        expect(A.inherits(Class)).toBe(true);
        expect(B.inherits(Class)).toBe(true);
        expect(C.inherits(Class)).toBe(true);
        expect(B.inherits(A)).toBe(true);
        expect(B.inherits(C)).toBe(false);
      });

    });

  });

  return Class;

});
