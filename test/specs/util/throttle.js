define(['real/util/throttle', 'nbd/Promise'], function(throttle, Promise) {
  'use strict';

  describe('util/throttle', function() {
    it('is a function', function() {
      expect(throttle).toEqual(jasmine.any(Function));
    });

    var spy;

    beforeEach(function() {
      spy = jasmine.createSpy('generator');
    });

    it('immediately calls the callback', function() {
      var retval = throttle(spy.and.returnValue('foo'));

      expect(spy).toHaveBeenCalled();
      expect(retval).toBe('foo');
    });

    it('delays on the thenable generator', function(done) {
      var p = new Promise();

      spy.and.returnValue(p);

      p.then(function() {
        expect(spy.calls.count()).toBe(1);
      }).finally(done);

      throttle(spy);
      throttle(spy);
      throttle(spy);
      throttle(spy);
      throttle(spy);

      expect(spy.calls.count()).toBe(1);
      p.resolve();
    });

    it('throttles based on the callback', function(done) {
      var p = new Promise(),
      call = jasmine.createSpy();

      spy.and.returnValue(p);
      throttle(spy);
      throttle(call);
      throttle(call);

      expect(call.calls.count()).toBe(2);
      expect(spy).toHaveBeenCalled();
      p.finally(done);
      p.resolve();
    });

    it('calls with rest arguments', function(done) {
      var p = Promise.resolve();

      spy.and.returnValue(p);

      p.then(function() {
        expect(spy.calls.count()).toBe(1);
        expect(spy).toHaveBeenCalledWith('foo', 'bar');
      }).finally(done);

      throttle(spy, 'foo', 'bar');
      throttle(spy, 'baz');
    });
  });

  return throttle;
});
