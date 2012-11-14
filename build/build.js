({
  baseUrl: '..',
  optimize: 'none',
  paths: {
    'jquery':'build/jquery.passthrough',
    'nbd':'.'
  },
  name: 'build/all',
  include: ['vendor/almond/almond'],
  wrap: {
    start: '(function(global) {',
    end: '}(this));'
  },
  out: 'nbd.js'
})
