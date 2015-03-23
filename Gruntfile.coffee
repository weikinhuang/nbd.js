module.exports = (grunt) ->
  grunt.initConfig({
    pkg: grunt.file.readJSON 'package.json'
    clean:
      build: ['dist']
    jshint:
      options:
        jshintrc: '.jshintrc'
      test: [
        '*.js'
        'trait/**/*.js'
        'util/**/*.js'
      ]
    uglify:
      options:
        screwIE8: true
      build:
        files:
          'dist/nbd.min.js': ['dist/**/*.js']
    babel:
      options:
        sourceMap: true
        modules: 'amd'
      dist:
        files: [
          expand: true
          src: ['*.js', 'trait/*.js', 'util/*.js', 'View/*.js', '!Gruntfile.js']
          dest: 'dist/'
        ]
    karma:
      options:
        configFile: 'test/karma.conf.js'
        singleRun: true
      persistent:
        singleRun: false
      single:
        browsers: ['PhantomJS']
      multi:
        reporters: ['dots'],
        browsers: ['PhantomJS', 'Firefox']
    promises:
      adapter: './test/lib/promise-adapter'
  })
  grunt.registerTask 'promises', 'Promises A+ Tests', () ->
    adapterFile = grunt.config ['promises', 'adapter']
    adapter = require adapterFile
    aplus = require 'promises-aplus-tests'
    aplus(adapter, {}, this.async())
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-karma'
  grunt.loadNpmTasks 'grunt-babel'
  grunt.registerTask 'build', ['clean:build', 'babel:dist', 'uglify:build']
  grunt.registerTask 'test', ['karma:persistent']
  grunt.registerTask 'travis', ['jshint', 'karma:multi', 'promises']
  grunt.registerTask 'default', ['build']
