define(['real/util/async'], function(async) {
  'use strict';

  describe('util/async', function() {
    it('runs the callback in a different callstack', function(done) {
      var spy = jasmine.createSpy('asyncspy');

      async(spy);

      setTimeout(function() {
        expect(spy).toHaveBeenCalled();
        done();
      }, 20);
    });
  });

  return async;
});
