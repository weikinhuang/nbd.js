module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: ['dist']
    },
    jshint: {
      options: {
        boss: true
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
      build: {
        options: grunt.file.readJSON('build/build.json')
      }
    },
    uglify: {
      build: {
        options: {
          report: 'gzip'
        },
        files: {
          'dist/nbd.min.js':['dist/nbd.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['clean', 'jshint', 'requirejs', 'uglify']);
};
