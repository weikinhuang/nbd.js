define(['./Entity', '../trait/responsive'], function(Controller, responsive) {
  'use strict';

  console.warn('nbd/Controller/Responsive is deprecated. Use nbd/Controller with nbd/trait/responsive');
  return Controller.extend().mixin(responsive);
});
