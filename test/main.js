require.onError=function(err) {
  throw new Error([err.requireType, err.requireModules].join(' '));
};
require({
  baseUrl: '/base/test/specs',
  paths: {
    'nbd': '.',
    'real': '../..',
    'index': '../../index',
  },
  map: {
    'index': {
      '.': 'nbd'
    }
  },
  deps: [
    '../lib/es5-shim'
  ]
}, ['index'], window.__karma__.start);
