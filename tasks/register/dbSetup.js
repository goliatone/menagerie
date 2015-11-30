'use strict';

var extend = require('gextend');

module.exports = function(grunt) {

    //TODO: We might want to do add a migrating true prop
    var sailsLoader = require('sails/lib/hooks/moduleloader')({
            config:{
                environment: process.env.NODE_ENV || 'development',
                paths:{},
                appPath: process.cwd(),
                dontFlattenConfig: true,
                moduleloader:{
                    configExt:['js']
                }
            },
            util: {
                merge: require('sails/node_modules/sails-util').merge
            }
    });

    var handlers = createHanlders(grunt);

    grunt.registerTask('db:setup', 'Setup database. Run without options to get more info.', function(command) {
        var done = this.async();

        if (!command) {
            usage(grunt);
            return done();
        }

        sailsLoader.loadUserConfig(function(err, out){

            var args = getCommandOptions(out);
            args.stdout = grunt.log.oklns;
            args.stderr = grunt.log.errorlns;

            console.log('Command', command, 'args', args, out.models);
            handlers.exec(command, args, done);
        });
    });
};


function getCommandOptions(config){
    var argv = buildArguments(),
        defaults = {};

    var connectionId = config.models.connection;

    if(connectionId){
        defaults = config.connections[connectionId];
    }

    defaults.connection = buildConnectionFromSailsConfig(defaults);

    return extend({}, /*config, */defaults, argv);
}

function buildArguments(defaults) {
    var args = process.argv.slice(3),
        K = require('gkeypath');

    function dashToCamel(str) {
        if(!str) return '';

        return str.replace(/\W+(.)/g, function (x, chr) {
            return chr.toUpperCase();
        });
    }

    var key, value,
        argv = args.reduce(function(out, option) {
            option = option.replace('--', '');

            key = option.split('=')[0];

            key = dashToCamel(key);

            if (option.indexOf('=') === -1) value = true;
            else value = option.split('=')[1];

            typeof value === 'string' && (value = value.split(/,\s?/));

            if(Array.isArray(value) && value.length === 1) value = value[0];

            K.set(out, key, value);

            return out;
        }, {});

    return argv;
}

function usage(grunt) {
    var ln = grunt.log.writeln;
    var commands = Object.keys(createHanlders({}).commandMap).join('|');
    ln('usage: grunt db:setup:<'+commands+'> [options]');
    ln('');
    ln('db:setup:create-user Options');
}

function exec_db(options, statement) {
    var connection = options.connection,
        dryRun = options.dryRun;

    console.log('======')
    console.log('connection', connection);
    console.log('options', options);
    console.log('QUERY\n', statement);
    console.log('======')

    var pg = require('pg');

    return new Promise(function(resolve, reject){

        if(options.dryRun){
            console.log('Running command with "--dry-run" option. Exiting now.');
            return resolve();
        }

        pg.connect(connection, function(err, client) {
            if (err) {
                pg.end();
                return reject(err);
            }

            client.query(statement, function(err, result) {
                if (err) {
                    pg.end();
                    return reject(err);
                }
                options.stdout('Result:', result);

                resolve(result);
            });
        });
    });
}


function createHanlders(grunt){

    var commandMap = {
        'create-user': createUser,
        'create-db': createDb,
        'assign-owner': assignOwner,
        'drop-db': dropDb,
        'drop-user': dropUser,
        'sql-file': sqlFile
    };

    function exec(commandId, args, done){
        var cmd = commandMap[commandId];
        cmd(args, done);
    }

    /**
     * Create Postgres user:
     * ```
     * grunt pgcreateuser --user=peperone --password=Password --roles=SUPERUSER,LOGIN,REPLICATION
     * ```
     */
    function createUser(data, callback) {
        //http://www.postgresql.org/docs/current/static/sql-createuser.html

        var stmt = 'CREATE USER ' + data.user;

        if (data.roles) stmt += ' ' + data.roles.join(', ');

        if (data.password) stmt += ' WITH PASSWORD \'' + data.password + '\'';

        stmt += ';';

        if(data.superuser) stmt += 'ALTER ROLE "' + data.user + '" WITH superuser;';

        exec_db(data, stmt).then(function(res) {
            grunt.log.writeln('Database user "' + data.user + '" created' + (data.roles ? ' with roles: ' + data.roles.join(', ') : '') + '.');
            callback();
        }).catch(function(err){
            console.err('ERROR', err);
            callback();
        });
    }

    function createDb(data, callback) {
        // do DB name and owner here:
        // * http://www.postgresql.org/docs/8.1/static/sql-createdatabase.html
        var stmt = 'CREATE DATABASE ' + data.name;

        if (data.owner) {
            stmt += ' WITH OWNER ' + data.owner;
        }

        if(!data.encoding) data.encoding = 'UTF-8';

        stmt += 'ENCODING=\''+data.encoding+'\'';

        exec_db(data, stmt).then(function(res) {
            grunt.log.writeln('Database "' + data.name + '" created.');
            callback();
        }).catch(function(err){
            console.err('ERROR', err);
            callback();
        });
    }

    function assignOwner(data, callback){
        var stmt = 'ALTER DATABASE ' + data.name + ' OWNER TO ' + data.owner;
        exec_db(data, stmt).then(function(res) {
            grunt.log.writeln('Database "' + data.name + '" created.');
            callback();
        }).catch(function(err){
            console.err('ERROR', err);
            callback();
        });
    }

    function dropDb(data, done){
        //http://www.postgresql.org/docs/current/static/sql-dropdatabase.html
        exec_db(data, 'DROP DATABASE IF EXISTS ' + data.name + ';').then(function(res) {
            grunt.log.writeln('Database "' + data.name + '" dropped.');
            done();
        }).catch(function(err){
            console.err('ERROR', err);
            done();
        });
    }
    function dropUser(data, done){
        var stmt = 'DROP ROLE IF EXISTS ' + data.user;
        exec_db(data, stmt).then(function(res) {
            grunt.log.writeln('Database user "' + data.user + '" dropped.');
            done();
        }).catch(function(err){
            console.err('ERROR', err);
            done();
        });
    }

    /**
     *
     * grunt pgsqlfile --connection.password=pepe --connection.name=something \
     *       --connection.host=pepe.dev --connection.port=9090 --connection.user=menagerie \
     *       --filename='pepe.json'
     */
    function sqlFile(data, done){
        var dataOut = data.stdout;
        var dataErr = data.stderr;

        var exec = require('child_process').exec;

        var command = (data.password ? 'PGPASSWORD=\'' + data.password + '\'' : '') +
            ' psql ' +
            ' -d ' + data.database +
            (data.host ? ' -h ' + data.host : '' ) +
            ' -p ' + data.port +
            ' -U ' + data.user +
            ' -w ' +
            ' -f ' + data.filename;

        //TODO: Add --dry-run
        if(data.dryRun){
            console.log(grunt.template.process(command));
            return done();
        }

        exec(grunt.template.process(command), data.execOptions, function(err, stdout, stderr) {
            if (stdout) {
                if (typeof dataOut === 'function') {
                    dataOut(stdout);
                } else if (dataOut === true) {
                    grunt.log.write(stdout);
                }
            }

            if (err) {
                if (typeof dataErr === 'function') {
                    dataErr(stderr);
                } else if (data.failOnError === true) {
                    grunt.fatal(err);
                } else if (dataErr === true) {
                    grunt.log.error(err);
                }
            }

            done();
        });
    }

    return {
        commandMap: commandMap,
        createDb: createDb,
        dropDb: dropDb,
        dropUser: dropUser,
        createUser: createUser,
        assignOwner: assignOwner,
        sqlFile: sqlFile,
        exec: exec
    };
}



function buildConnectionFromSailsConfig(options) {
    // return the options url if one is configured
    if (options.url) return options.url;

    var scheme,
        url;

    switch (options.adapter) {
        case 'sails-mysql':
            scheme = 'mysql';
        break;
        case 'sails-postgresql':
            scheme = 'postgres';
        break;
        default:
            throw new Error('migrations not supported for ' + options.adapter);
    }

    url = scheme + '://';

    if (options.user) {
        url += options.user;
            if (options.password) {
                url += ':' + encodeURIComponent(options.password);
            }
        url += '@';
    }

    url += options.host || 'localhost';
    if (options.port) url += ':' + options.port;

    if (options.database) url += '/' + encodeURIComponent(options.database);

    return url;
}
