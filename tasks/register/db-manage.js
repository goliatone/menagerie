'use strict';

var extend = require('gextend');
var buildArguments = require('../_buildArguments');

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

    grunt.registerTask('db:manage', 'Setup database. Run without options to get more info.', function(command) {
        var done = this.async();

        if (!command) {
            usage(grunt);
            return done();
        }

        sailsLoader.loadUserConfig(function(err, out){

            var args = getCommandOptions(out);
            args.stdout = grunt.log.oklns;
            args.stderr = grunt.log.errorlns;

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

    var out = extend({}, /*config, */defaults, argv);

    out.connection = buildConnectionFromSailsConfig(out);

    return out;
}

function usage(grunt) {
    var ln = grunt.log.writeln;
    var commands = Object.keys(createHanlders({}).commandMap).join('|');
    ln('');
    ln('usage: grunt db:manage:<'+commands+'> [options]');
    ln('');
    ln('Available subcommands are:');
    ln('');
    ln('  create-db: --database, --owner, --encoding');
    ln('  create-user: --roles, --user, --password, --superuser');
    ln('  assign-owner: --database, --owner');
    ln('  drop-db: --database');
    ln('  drop-user: --user');
    ln('  sql-file: --connection.database, --connection.host, --connection.port, --connection.user, --connection.filename');
    ln('');
    ln('The tasks merges Sails config.models.connection into a configuration object that can be');
    ln('overridden through terminal options.');
    ln('');
    ln('');
    ln('Examples:');
    ln('');
    ln('  grunt db:manage:create-user --user=peperone --password=Password --roles=SUPERUSER,LOGIN,REPLICATION');
    ln('');
    ln('  grunt db:manage:sql-file --connection.password=pepe --connection.name=something \\');
    ln('\t--connection.host=things.menagerie.dev --connection.port=5432 --connection.user=menagerie \\');
    ln('\t--filename=migration_file.sql');
}

function exec_db(options, statement) {
    var connection = options.connection,
        dryRun = options.dryRun;

    console.log('======');
    console.log('connection', connection);
    console.log('options', options);
    console.log('QUERY\n', statement);
    console.log('======');

    var pg = require('pg');

    return new Promise(function(resolve, reject){

        if(options.dryRun){
            console.log('Running command with "--dry-run" option. Exiting now.');
            return resolve();
        }

        pg.connect(connection, function(err, client) {
            if (err) {
                console.log('Connection Error', err);
                pg.end();
                return reject(err);
            }

            console.log('Executing query', statement);

            client.query(statement, function(err, result) {
                if (err) {
                    pg.end();
                    console.log('Client Error:', err.message);

                    if(err.detail && err.detail === 'There is 1 other session using the database.'){
                        console.log('There is 1 other session using the database.');
                        console.log('Close other clients before dropping the database.');
                    } else if(err.message && err.message.indexOf('cannot drop the currently open database') !== -1){
                        console.log('You are opening a connection to the database you want to delete.');
                        console.log('Close other clients before dropping the database.');
                        console.log('One quick way to get around this is to connect to a different database.');
                        console.log('Override the connection database by adding --connection.database=postgres');
                    }

                    //This error does not propagate on Promise?
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
     * grunt db:manage:create-user --user=peperone --password=Password --roles=SUPERUSER,LOGIN,REPLICATION
     * ```
     */
    function createUser(data, callback) {
        //http://www.postgresql.org/docs/current/static/sql-createuser.html

        var sql = 'CREATE USER ' + data.user;

        if (data.roles) sql += ' ' + data.roles.join(', ');

        if (data.password) sql += ' WITH PASSWORD \'' + data.password + '\'';

        sql += ';';

        if(data.superuser) sql += 'ALTER ROLE "' + data.user + '" WITH superuser;';

        exec_db(data, sql).then(function(res) {
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
        var sql = 'CREATE DATABASE ' + data.database;

        if (data.owner) {
            sql += ' WITH OWNER ' + data.owner;
        }

        if(!data.encoding) data.encoding = 'UTF-8';

        sql += ' ENCODING=\''+data.encoding+'\'';

        exec_db(data, sql).then(function(res) {
            grunt.log.writeln('Database "' + data.database + '" created.');
            callback();
        }).catch(function(err){
            console.err('ERROR', err);
            callback();
        });
    }

    function assignOwner(data, callback){
        var sql = 'ALTER DATABASE ' + data.database + ' OWNER TO ' + data.owner;
        exec_db(data, sql).then(function(res) {
            grunt.log.writeln('Database "' + data.database + '" created.');
            callback();
        }).catch(function(err){
            console.err('ERROR', err);
            callback();
        });
    }

    function dropDb(data, done){
        //http://www.postgresql.org/docs/current/static/sql-dropdatabase.html
        exec_db(data, 'DROP DATABASE IF EXISTS ' + data.database + ';').then(function(res) {
            grunt.log.writeln('Database "' + data.database + '" dropped.');
            done();
        }).catch(function(err){
            console.err('ERROR', err);
            done();
        });
    }
    function dropUser(data, done){
        var sql = 'DROP ROLE IF EXISTS ' + data.user;
        exec_db(data, sql).then(function(res) {
            grunt.log.writeln('Database user "' + data.user + '" dropped.');
            done();
        }).catch(function(err){
            console.err('ERROR', err);
            done();
        });
    }

    /**
     *
     * grunt db:manage:sql-file --connection.password=pepe --connection.name=something \
     *       --connection.host=pepe.dev --connection.port=9090 --connection.user=menagerie \
     *       --filename='pepe.json'
     */
    function sqlFile(data, done){
        var dataOut = data.stdout;
        var dataErr = data.stderr;

        var exec = require('child_process').exec;

        var command = (data.password ? 'PGPASSWORD=\'' + data.password + '\'' : '') +
            ' psql' +
            ' -d ' + data.database +
            (data.host ? ' -h ' + data.host : '' ) +
            ' -p ' + (data.port || 5432) +
            ' -U ' + data.user +
            ' -w' +
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

    if(options.connectionDatabase) url += '/' + encodeURIComponent(options.connectionDatabase);
    else if (options.database) url += '/' + encodeURIComponent(options.database);
    console.log('options', options.connectionDatabase)

    return url;
}
