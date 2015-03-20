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
        'trait/**/*.js',
        'util/**/*.js'
      ],
    },
    requirejs: {
      build: {
        options: {
          "baseUrl": ".",
          "optimize": "none",
          "name": "index",
          "useStrict": true,
          "include": ["node_modules/almond/almond"],
          "wrap": {
            "start": "(function(root) {",
            "end": "return root.nbd = require('index'); })(this);"
          },
          "out": "dist/nbd.js"
        }
      }
    },
    uglify: {
      build: {
        options: {
          report: 'gzip'
        },
        files: {
          'dist/nbd.min.js': ['dist/nbd.js']
        }
      }
    },
    babel: {
      options: {
        sourceMap: true,
        modules: 'amd'
      },
      dist: {
        files: [{
          expand: true,
          src: ['*.js', 'trait/*.js', 'util/*.js', '!index.js', '!Gruntfile.js'],
          dest: 'dist/'
        }]
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
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('build', ['clean:build', 'requirejs:build', 'uglify:build']);
  grunt.registerTask('test', ['karma:persistent']);
  grunt.registerTask('travis', ['jshint', 'karma:multi', 'promises']);
  grunt.registerTask('default', ['jshint', 'build']);
};
