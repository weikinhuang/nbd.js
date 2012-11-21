/*global jasmine, describe, it, expect, spyOn, afterEach */
define(['real/Events'], function(Events) {
  'use strict';

  describe('Events', function() {
    it('should exist', function() {
      expect(Events).toBeDefined();
      expect(Events).toEqual(jasmine.any(Object));
    });

    it('should have an interface', function() {
      expect(Events.bind).toBeDefined();
      expect(Events.unbind).toBeDefined();
      expect(Events.trigger).toBeDefined();
      expect(Events.option).toBeDefined();
      expect(Events.updateOptions).toBeDefined();
    });

    describe('Events.trigger', function() {
      var spies = {
        first : function() {},
        middle : function() {},
        last : function() {}
      };

      afterEach(function() {
        Events.unbind('test');
      });

      it('should call bound functions', function() {
        var rand = Math.random(), now = Date.now();

        spyOn( spies, 'first' );
        spyOn( spies, 'last' );

        Events.bind( 'test', spies.first );
        Events.bind( 'test', spies.last );
        Events.trigger( 'test', rand, now );

        expect( spies.first ).toHaveBeenCalledWith(rand, now);
        expect( spies.last ).toHaveBeenCalledWith(rand, now);
      });

      it('should only call functions bound to the namespace', function() {
        spyOn( spies, 'middle' );
        Events.bind( 'test', spies.middle );
        Events.trigger( 'test_' );

        expect( spies.middle ).not.toHaveBeenCalled();
      });

      it('should stop calling on return of false', function() {
        spyOn( spies, 'first' ).andReturn(false);
        spyOn( spies, 'last' );

        Events.bind( 'test', spies.first );
        Events.bind( 'test', spies.last );
        Events.trigger( 'test' );

        expect( spies.first ).toHaveBeenCalled();
        expect( spies.last ).not.toHaveBeenCalled();
      });

    });

    describe('Events.bind', function() {

      var noop = function() {};

      it('should not allow bad event names', function() {
        expect(function(){ Events.bind( 0, noop ); }).toThrow('Invalid event name');
        expect(function(){ Events.bind( {}, noop ); }).toThrow('Invalid event name');
        expect(function(){ Events.bind( [], noop ); }).toThrow('Invalid event name');
        expect(function(){ Events.bind( true, noop ); }).toThrow('Invalid event name');
        expect(function(){ Events.bind( null, noop ); }).toThrow('Invalid event name');
        expect(function(){ Events.bind( NaN, noop ); }).toThrow('Invalid event name');
        expect(function(){ Events.bind( Infinity, noop ); }).toThrow('Invalid event name');
        expect(function(){ Events.bind( undefined, noop ); }).toThrow('Invalid event name');
        expect(function(){ Events.bind( /.*/, noop ); }).toThrow('Invalid event name');
      });

      it('should not allow non-function callbacks', function() {
        expect(function(){ Events.bind( 'test', 0 ); }).toThrow('Invalid callback');
        expect(function(){ Events.bind( 'test', {} ); }).toThrow('Invalid callback');
        expect(function(){ Events.bind( 'test', [] ); }).toThrow('Invalid callback');
        expect(function(){ Events.bind( 'test', true ); }).toThrow('Invalid callback');
        expect(function(){ Events.bind( 'test', null ); }).toThrow('Invalid callback');
        expect(function(){ Events.bind( 'test', NaN ); }).toThrow('Invalid callback');
        expect(function(){ Events.bind( 'test', Infinity ); }).toThrow('Invalid callback');
        expect(function(){ Events.bind( 'test', undefined ); }).toThrow('Invalid callback');
        expect(function(){ Events.bind( 'test', /.*/ ); }).toThrow('Invalid callback');
      });

      it('should not allow multiple bind options', function() {
        Events.bind('test', noop, 'memory');
        expect(function(){ Events.bind('test', noop, 'stopOnFalse'); }).toThrow();

        this.after(function() { Events.unbind('test'); });
      });

    });

    describe('Events.unbind', function() {
      var spies = {
        first : function() {},
        last : function() {}
      };

      it('should allow unbinding nonexistent events', function() {
        expect(function(){ Events.unbind( 'lalilulelo' ); }).not.toThrow();
      });

      afterEach(function() {
        Events.unbind('test');
      });

      it('should unbind a function', function() {
        spyOn( spies, 'first' );
        spyOn( spies, 'last' );

        Events.bind( 'test', spies.first );
        Events.bind( 'test', spies.last );
        Events.unbind( 'test', spies.first );
        Events.trigger( 'test' );

        expect( spies.first ).not.toHaveBeenCalled();
        expect( spies.last ).toHaveBeenCalled();
      });

      it('should unbind all functions', function() {
        spyOn( spies, 'first' );
        spyOn( spies, 'last' );

        Events.bind( 'test', spies.first );
        Events.bind( 'test', spies.last );
        Events.unbind( 'test' );
        Events.trigger( 'test' );

        expect( spies.first ).not.toHaveBeenCalled();
        expect( spies.last ).not.toHaveBeenCalled();
      });

    });

    describe('Events.option', function() {
      var spies = {
        first : function() {},
        last : function() {}
      };

      afterEach(function() {
        Events.unbind('test');
      });

      it('should change callback options', function() {
        spyOn( spies, 'first' ).andReturn(false);
        spyOn( spies, 'last' );

        Events.bind('test', spies.first);
        Events.option('test', 'memory');
        Events.trigger('test');
        Events.bind('test', spies.last);

        expect( spies.last ).toHaveBeenCalled();
      });

      it('should set options on an event that doesn\'t exist', function() {
        spyOn( spies, 'first' );
        Events.option('test', 'once');
        Events.bind('test', spies.first);
        Events.trigger('test');
        Events.trigger('test');
        Events.trigger('test');

        expect( spies.first ).toHaveBeenCalled();
        expect( spies.first.callCount ).toBe(1);
      });

    });

    describe('Events.updateOptions', function() {
      it('should not allow updating nonexistant events', function() {
        expect(function(){ Events.updateOptions('test','memory'); }).toThrow();
      });
    });

  });

  return Events;
});
