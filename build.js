({
  baseUrl: '.',
  dir: './artifacts',
  optimize: 'none',
  paths: {
    'jquery':'vendor/jquery',
    'nbd':'.'
  },
  name: 'nbd/nbd',
  include : ['vendor/almond'],
  // Specifically excluding jQuery
  exclude : ['jquery']
})
