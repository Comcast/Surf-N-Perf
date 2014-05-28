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
        }
    });


    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);
};
