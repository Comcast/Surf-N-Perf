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
                src: 'surfnperf.js'
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
    grunt.registerTask('build', ['jshint', 'jsbeautifier', 'karma:continuous', 'uglify']);
};
