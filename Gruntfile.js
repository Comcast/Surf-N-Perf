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
        src: ['**/*.js', '!**/*.min.js', '!node_modules/**/*', '!coverage/**/*'],
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
      },
    },
    jsdoc: {
      dist: {
        src: ['surfnperf.js'],
        options: {
          destination: 'doc'
        }
      }
    },
    watch: {
      dev: {
        files: ['surfnperf.js', 'spec/**/*.js'],
        tasks: ['jshint', 'jsbeautifier', 'uglify', 'jsdoc'],
        options: {
          spawn: false,
          atBegin: true
        }
      }
    },
    concurrent: {
      target: {
        tasks: ['karma:unit', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('default', ['jshint', 'karma:continuous', 'jsdoc']);
  grunt.registerTask('build', ['jshint', 'karma:continuous', 'uglify']);
  grunt.registerTask('precommit', ['jsbeautifier', 'build']);
  grunt.registerTask('dev', ['concurrent:target']);
};
