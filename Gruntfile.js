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
    jsbeautifier: {
      dist: {
        // any javascript that is not minified
        // and not part of the node_modules, coverage or spec folder
        src: ['**/*.js', '!**/*.min.js', '!node_modules/**/*', '!coverage/**/*', '!spec/**/*'],
        options: {
          js: {
            indentSize: 2,
            space_before_conditional: false
          }
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      },
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['jshint', 'karma:continuous']);
  grunt.registerTask('build', ['jshint', 'karma:continuous', 'uglify']);
  grunt.registerTask('precommit', ['jsbeautifier', 'build']);
};
