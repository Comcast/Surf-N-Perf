module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    uglify: {
      options: {
        preserveComments: 'some'
      },
      dist: {
        files: {
          'surfnperf.min.js': 'surfnperf.js',
          'resource-timing.js': 'lib/resource-timing.js'
        }
      }
    },
    jshint: {
      all: ['surfnperf.js', 'lib/resource-timing.js']
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
        configFile: 'karma.conf.js',
        autoWatch: true
      },
      continuous: {
        configFile: 'karma.conf.js',
        singleRun: true
      },
    },
    jsdoc: {
      dist: {
        src: ['./*.js', './lib/*.js', './README.md'],
        options: {
          destination: './_build/docs',
          configure: './jsdoc-conf.json',
          template: './node_modules/jaguarjs-jsdoc',
          private: false
        }
      }
    },
    watch: {
      dev: {
        files: ['surfnperf.js', 'spec/**/*.js', 'lib/resource-timing.js'],
        tasks: ['jshint', 'jsbeautifier', 'uglify'],
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

  grunt.registerTask('default', ['jshint', 'karma:continuous']);
  grunt.registerTask('build', ['jshint', 'karma:continuous', 'uglify']);
  grunt.registerTask('precommit', ['jsbeautifier', 'build']);
  grunt.registerTask('dev', ['concurrent:target']);
};
