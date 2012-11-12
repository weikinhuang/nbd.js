({
  baseUrl: '.',
  dir: './artifacts',
  optimize: 'uglify',
  paths: {
    'jquery':'vendor/jquery',
    'nbd':'.'
  },
  modules: [{
    name: 'nbd/nbd',
    include: [
      'nbd/Model',
      'nbd/View/Entity',
      'nbd/View/Element',
      'nbd/View/Dialog',
      'nbd/Controller/Entity',
      'nbd/Controller/Dialog',
      'nbd/Keyhandler'
    ],
    // Specifically excluding jQuery because that is loaded with requirejs
    exclude : ['jquery']
  }]
})
