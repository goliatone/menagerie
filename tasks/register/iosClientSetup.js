'use strict';

var buildArguments = require('../_buildArguments');

module.exports = function (grunt) {
    var Sails = require('sails').Sails;

    grunt.registerTask('menagerie:user', 'Manage user create|delete|update', function (command) {
        var done = this.async();

        var env;

        if (!command) {
          usage(grunt);
          return done();
        }

        if (grunt.option('env')){
          env = grunt.option('env');
        }else{
          env = process.env.NODE_ENV;
        }

        var config = {
          port: -1,
          log: { level: process.env.LOG_LEVEL || 'silent' },
          environment: env,
          migrating: true
        };

        var options = buildArguments();

        // lift Sails to get the effective configuration. We don't actually need to
        // run it, and we certainly don't want any log messages. We just want the
        // config.
        var sails = new Sails();
        sails.lift(config, function (err) {
            var url;

            if (err) {
                grunt.fail.fatal('Could not lift sails', err);
                return done();
            }

            exec(command, options, done);

            function onDone(err, res){
                if(err) grunt.fail.fatal(err);
                console.log(res);
                done(err, res);
            }
            function exec(command, options, done){
                console.log('COMMAND', command, 'options', options);
                switch(command){
                    case 'create':
                        User.findOrCreate({
                            email: options.email
                        }, {
                            email: options.email,
                            username: options.username
                        }).exec(onDone);
                    break;
                    case 'update':
                        var id = options.id;
                            delete options.id;
                        User.udpate({
                            id: id
                        }, options).exec(onDone);
                    break;
                    case 'delete':
                        User.destroy(options).exec(onDone);
                    break;
                    default:
                        grunt.log.errorlns('Command not recognized', command);
                        done();
                        break;
                }
            }
        });
    });

    //Manage token:
     grunt.registerTask('menagerie:token', 'Generate API token', function (command) {
        var done = this.async();
        var randomToken = require('random-token').create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

        var env;

        if (!command) {
          usage(grunt);
          return done();
        }

        if (grunt.option('env')){
          env = grunt.option('env');
        }else{
          env = process.env.NODE_ENV;
        }

        var config = {
          port: -1,
          log: { level: process.env.LOG_LEVEL || 'silent' },
          environment: env,
          migrating: true
        };

        var options = buildArguments();

        // lift Sails to get the effective configuration. We don't actually need to
        // run it, and we certainly don't want any log messages. We just want the
        // config.
        var sails = new Sails();
        sails.lift(config, function (err) {
            var url;

            if (err) {
                grunt.fail.fatal('Could not lift sails', err);
                return done();
            }

            exec(command, options, done);

            function onDone(err, res){
                if(err) grunt.fail.fatal(err);
                console.log(res);
                done(err, res);
            }
            function exec(command, options, done){
                console.log('COMMAND', command, 'options', options);
                switch(command){
                    case 'create':
                        var token = randomToken(32) + randomToken(32);
                        Passport.findOrCreate({
                            user: options.userid
                        }, {
                            user: options.userid,
                            protocol: 'token',
                            accessToken: token,
                            tokens: {
                                token: token
                            }
                        }).exec(onDone);
                    break;
                    case 'update':
                        var id = options.id;
                            delete options.id;
                        Passport.update({
                            accessToken: options.oldToken
                        }, {accessToken: options.newToken}).exec(onDone);
                    break;
                    case 'delete':
                        Passport.destroy({token: options.token}).exec(onDone);
                    break;
                    default:
                        grunt.log.errorlns('Command not recognized', command);
                        done();
                        break;
                }
            }
        });
     });
};

function usage(grunt){
    console.log('grunt menagerie:user:create --username=<USERNAME> --email=<EMAIL>');
}
