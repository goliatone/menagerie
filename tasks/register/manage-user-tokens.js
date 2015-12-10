'use strict';

var buildArguments = require('../_buildArguments');

module.exports = function (grunt) {
    var Sails = require('sails').Sails;

    grunt.registerTask('menagerie:location', 'Manage location create|delete|update|list-options', function(command){
        var done = this.async();

        if (!assertCommand(command, grunt)) return done();
        if(command === 'describe'){
            describeSubcommand(grunt, 'location', command, ['uuid', 'name', 'description']);
            return done();
        }

        var config = getConfig(grunt),
            options = buildArguments();

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
                        Location.create({
                            uuid: options.uuid,
                            name: options.name,
                            description: options.description
                        }).exec(onDone);
                    break;
                    case 'update':
                        var id = options.id;
                            delete options.id;
                        Location.update({
                            id: id
                        }, {
                            uuid: options.uuid,
                            name: options.name,
                            description: options.description
                        }).exec(onDone);
                    break;
                    case 'delete':
                        Location.destroy({id: options.id}).exec(onDone);
                    break;
                    default:
                        grunt.log.errorlns('Command not recognized', command);
                        done();
                        break;
                }
            }
        });
    });

    grunt.registerTask('menagerie:user', 'Manage user create|delete|update|list-options', function (command) {
        var done = this.async();

        if (!assertCommand(command, grunt)) return done();
        if(command === 'describe') {
            describeSubcommand(grunt, 'user', command, ['uuid', 'name', 'description']);
            return done();
        }

        var config = getConfig(grunt),
            options = buildArguments();

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
    grunt.registerTask('menagerie:token', 'Manage API tokens create|delete|update|list-options', function (command) {
        var done = this.async();

        if (!assertCommand(command, grunt)) return done();
        if(command === 'describe'){
            return describeSubcommand(grunt, 'token', command, ['uuid', 'name', 'description']);
        }

        var config = getConfig(grunt),
            options = buildArguments(),
            randomToken = require('random-token').create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

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
    var ln = grunt.log.writeln;
    ln('');
    ln('Provides CRUD interface for Location, User, and Token models.');
}

function getConfig(grunt){
    var env;

    if (grunt.option('env')) env = grunt.option('env');
    else env = process.env.NODE_ENV;

    var config = {
        port: -1,
        log: { level: process.env.LOG_LEVEL || 'silent' },
        environment: env,
        migrating: true
    };

    return config;
}


function assertCommand(command, grunt){

    if (!command || !command.match(/create|delete|update|list-options/)) {
        usage(grunt);
        return false;
    }

    return true;
}

function describeSubcommand(grunt, command, subcommand, options){
    var ln = grunt.log.writeln;
    ln('');
    ln('Usage:');
    ln('$ grunt menagerie:' + command + ':' + subcommand );
    ln('');
    ln('Options:');
    options.map(function(o){
        ln('--' + o);
    });
}
