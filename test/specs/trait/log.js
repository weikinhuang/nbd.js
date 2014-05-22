define(['real/trait/log', 'nbd/Logger'], function(log, Logger) {
  'use strict';

  describe('trait/log', function() {
    it('provides .log', function() {
      expect(log.log).toBeDefined();
    });

    it('provides an instance of Logger', function() {
      expect(log.log).toEqual(jasmine.any(Logger));
    });
  });

  return log;
});
