module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: ['dist']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      test: [
        '*.js',
        'Model/**/*.js',
        'View/**/*.js',
        'Controller/**/*.js',
        'trait/**/*.js',
        'util/**/*.js'
      ],
    },
    requirejs: {
      options: {
        "name": "index",
        "baseUrl": ".",
        "optimize": "none",
        "useStrict": true,
        "paths": {
          "nbd": "."
        }
      },
      build: {
        options: {
          "out": "dist/nbd.js",
          excludeShallow: ['index']
        }
      },
      buildGlobal: {
        options: {
          "include": ["node_modules/almond/almond"],
          "wrap": {
            "start": "(function(root) {",
            "end": "return root.nbd = require('index'); })(this);"
          },
          "out": "dist/nbd.global.js"
        }
      }
    },
    uglify: {
      build: {
        options: {
          report: 'gzip'
        },
        files: {
          'dist/nbd.min.js': ['dist/nbd.js'],
          'dist/nbd.global.min.js': ['dist/nbd.global.js']
        }
      }
    },
    karma: {
      options: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      },
      persistent: {
        singleRun: false
      },
      single: {
        browsers: ['PhantomJS']
      },
      multi: {
        reporters: ['dots'],
        browsers: ['PhantomJS', 'Firefox'/*, 'Chrome'*/]
      }
    },
    promises: {
      adapter: './test/lib/promise-adapter'
    }
  });

  grunt.registerTask('promises', 'Promises A+ Tests', function() {
    var adapterFile = grunt.config(['promises', 'adapter']),
    adapter = require(adapterFile),
    aplus = require('promises-aplus-tests');
    aplus(adapter, {}, this.async());
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('build', ['clean:build', 'requirejs:build', 'requirejs:buildGlobal', 'uglify:build']);
  grunt.registerTask('test', ['karma:persistent']);
  grunt.registerTask('travis', ['jshint', 'karma:multi']);
  grunt.registerTask('default', ['jshint', 'build']);
};
