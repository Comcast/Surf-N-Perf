module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    uglify: {
      options: {
        preserveComments: 'some'
      },
      dist: {
        files: {
          'surfnperf.min.js': 'surfnperf.js'
        }
      }
    },
    jshint: {
      all: 'surfnperf.js'
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      },
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    watch: {
      dev: {
        files: ['surfnperf.js', 'spec/**/*.js'],
        tasks: ['default']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['jshint', 'karma:continuous']);
  grunt.registerTask('dev', ['watch:dev']);
  grunt.registerTask('build', ['jshint', 'karma:continuous', 'uglify']);
};
