var tests = Object.keys(window.__karma__.files).filter(function (file) {
  return (/test\/specs\/(.+\/)*.*\.js$/).test(file);
});

requirejs.config({
  baseUrl: '/base',
  paths: {
    'nbd' : '.'
  },
  deps: tests,
  callback: window.__karma__.start
});
