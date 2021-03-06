'use strict';

module.exports = function (grunt) {

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        newer: {
            options: {
                override: function(detail, include) {
                    include( false );
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                '*.js',
                'client/**/*.js',
                'server/**/*.js',
                'test/**/*.js',
                '!server/public/**/*.js'
            ]
        },

        less: {
            development: {
                options: {
                    //compress: true  //minifying the result
                },
                files: {
                    'server/public/css/application.css' : 'client/styles/application.less'
                }
            }
        },

        jade: {
            angular: {
              options: {
                client: false,
                pretty: true
              },
              files: [{
                cwd: 'client/angular/',
                src: ['**/*.jade'],
                dest: 'server/public/html',
                expand: true,
                ext: '.html'
              }]
            },
            static: {
              options: {
                client: false,
                pretty: true
              },
              files: [{
                cwd: 'client/static/',
                src: ['*.jade'],
                dest: 'server/public/static',
                expand: true,
                ext: '.html'
              }]
            }
        },

        concat: {
          options: {
            separator: '\n'
          },
          angular: {
            src: [
              'bower_components/jquery/dist/jquery.js',
              'bower_components/bootstrap3-wysihtml5-bower/dist/bootstrap3-wysihtml5.all.js',
              'bower_components/jquery-ui/jquery-ui.js',
              'bower_components/jquery.videoBG/jquery.videoBG.js',
              'bower_components/underscore/underscore.js',
              'bower_components/socket.io-client/socket.io.js',
              'bower_components/moment/moment.js',
              'bower_components/fullcalendar/dist/fullcalendar.js',
              'bower_components/bootstrap/dist/js/bootstrap.js',
              'bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
              'bower_components/jquery.slimscroll/jquery.slimscroll.min.js',
              'bower_components/fastclick/lib/fastclick.js',
              'bower_components/icheck/icheck.min.js',
              'bower_components/Chart.js/Chart.js',
              'bower_components/angular/angular.js',
              'bower_components/angular-ui-router/release/angular-ui-router.js',
              'bower_components/angular-ui-sortable/sortable.min.js',
              'bower_components/angular-ui-bootstrap/src/modal/modal.js',
              'bower_components/angular-ui-bootstrap/src/typeahead/typeahead.js',
              'bower_components/angular-ui-bootstrap/src/position/position.js',
              'bower_components/angular-ui-bootstrap/src/bindHtml/bindHtml.js',
              'bower_components/angular-ui-bootstrap/src/tabs/tabs.js',
              'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
              'bower_components/angular-resource/angular-resource.js',
              'bower_components/angular-route/angular-route.js',
              'bower_components/angular-cookies/angular-cookies.js',
              'bower_components/angular-sanitize/angular-sanitize.js',
              'bower_components/angular-animate/angular-animate.js',
              'bower_components/angular-touch/angular-touch.js',
              'bower_components/angular-loading-bar/build/loading-bar.js',
              'bower_components/angular-underscore/angular-underscore.min.js',
              'bower_components/angular-socket-io/socket.js',
              'bower_components/angular-chart.js/dist/angular-chart.js',
              'bower_components/angular-moment/angular-moment.min.js',
              'bower_components/matchHeight/jquery.matchHeight-min.js',
              'client/AdminLTE/AdminLTE.js'
            ],
            dest: 'server/public/js/angular.js'
          },
          utils: {
              src: [
                  'bower_components/jquery/dist/jquery.js',
                  'bower_components/jquery.videoBG/jquery.videoBG.js',
                  'bower_components/bootstrap/dist/js/bootstrap.js',
                  'bower_components/requirejs/require.js',
                  'client/requirejs/setup.js'
              ],
              dest: 'server/public/js/utils.js'
          },
          application: {
            src: [
              'server/public/js/angular.js',
              'client/AdminLTE/AdminLTE.js',
              'client/angular/application.js',
              'client/angular/**/*.js'
            ],
            dest: 'server/public/js/application.js'
          }
        },

        connect: {
            options: {
                port: 9000,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    livereload: 35729,
                    open: true,
                    base: ['server']
                }
            },
            test: {
                options: {
                    base: ['server']
                }
            }
        },

        protractor: {
            options: {
                configFile: 'test/client.conf.js', // Default config file
                // keepAlive: true, // If false, the grunt process stops when the test fails.
                noColor: false, // If true, protractor will not use colors in its output.
                //debug: true,
                args: {
                    verbose: true
                }
            },
            e2e: {
                options: {
                    keepAlive: false
                }
            },
            continuous: {
                options: {
                    keepAlive: true
                }
            }
        },

        exec: {
            npmTest: 'npm test'
        },

        copy: {
            build: {
                cwd: 'bower_components',
                src: [ 'fontawesome/fonts/*.{otf,eot,svg,ttf,woff,woff2}', 'bootstrap/fonts/*.{otf,eot,svg,ttf,woff,woff2}'],
                dest: 'server/public/fonts',
                expand: true,
                flatten: true
            },
            jade: {
                cwd: 'client/views',
                src: ['**/_*.jade'],
                dest: 'server/views',
                expand: true
            },
            html: {
                cwd: 'client/angular',
                src: ['**/*.html'],
                dest: 'server/public/html',
                expand: true
            },
            dev: {
                cwd: 'client/angular',
                src: ['**/*.js'],
                dest: 'server/public/js/angular',
                expand: true
            },
            devScripts: {
                src: 'server/public/dev-scripts.jade',
                dest: 'server/views/common/_scripts.jade'
            },
            requireJs: {
                cwd: 'client/requirejs',
                src: ['**/*.js', '!setup.js'],
                dest: 'server/public/require',
                expand: true
            }
        },
        
        watch: {
            less: {
                files: ['client/styles/**/*.less','client/angular/**/*.less'],
                tasks: ['less']
            },
            angularJade: {
                files: ['client/angular/**/*.jade', '!client/**/_*.jade'],
                tasks: ['newer:jade:angular'],
                options: {
                    interrupt: true
                }
            },
            staticJade: {
                files:['client/static/*.jade'],
                tasks:['newer:jade:static'],
                options: {
                  interrupt: true
                }
            },
            protractor: {
                files: ['client/**/*.js', 'test/**/*.js'],
                tasks: ['protractor:continuous']
            },
            serverJade: {
                files: ['client/views/**/_*.jade'],
                tasks: ['newer:jade']
            },
            scriptsClient: {
                files: ['client/angular/**/*.js'],
                tasks: ['newer:copy:dev','newer:jshint:all'],
                options: {
                    interrupt: true
                }
            },
            scriptsServer: {
                files: [
                    'server/**/*.js',
                    '!server/public/**/*.js',
                    'test/**/*.js'
                ],
                tasks: ['newer:jshint:all']
            },
            scriptsGrunt: {
                files: [
                    '*.js'
                ],
                tasks: ['newer:jshint:all']
            },
            scriptsTests: {
                files: [
                    'test/**/*.js'
                ],
                tasks: ['jshint:all']
            }
        },
        tags: {
            build: {
                options: {
                    scriptTemplate: 'script( src="/assets/{{ path }}")',
                    openTag: '<!-- start template tags -->',
                    closeTag: '<!-- end template tags -->'
                },
                src: [
                    'server/public/js/angular/application.js',
                    'server/public/js/angular/**/*.js'
                ],
                dest: 'server/public/dev-scripts.jade'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-browser-sync');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['less', 'jade', 'concat', 'copy']);
    grunt.registerTask('build-dev', ['less', 'jade', 'tags', 'copy:dev', 'copy:devScripts', 'concat:angular']);
    grunt.registerTask('e2e-test', ['connect:test',  'protractor:e2e' ]);
};
