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

    grunt.registerTask('db:setup', 'Setup database', function(command) {
        var done = this.async();

        console.log('HELP', grunt.option('help'));
        if (!command) {
            usage(grunt);
            return done();
        }

        console.log('stdout', grunt.stdout);
        console.log('failOnError', grunt.failOnError);

        sailsLoader.loadUserConfig(function(err, out){

            var args = getCommandOptions(out);

            console.log('Command', command, 'args', args);
            handlers.exec(command, args, done);
        });
    });

    /**
     * Create Postgres user:
     * ```
     * grunt pgcreateuser --user=peperone --password=Password --roles=SUPERUSER,LOGIN,REPLICATION
     * ```
     */
    grunt.registerTask('pg_createuser', 'Add a new Postgres user.', function(){
        var done = this.async(),
            data = buildArguments();
        handlers.createUser(data, done);
    });

    grunt.registerTask('pg_createdb', 'Create a new Postgres database.', function(){
        var done = this.async(),
            data = buildArguments();
        handlers.createDb(data, done);
    });

    grunt.registerTask('pg_owner', 'Change the owner of a Postgres database.', function() {
        var done = this.async(),
            data = buildArguments();
        handlers.assignOwner(data, done);
    });

    grunt.registerTask('pg_dropdb', 'Drop a Postgres database.', function() {
        var done = this.async(),
            data = buildArguments();
        handlers.dropDb(data, done);
    });

    grunt.registerTask('pg_dropuser', 'Drop a Postgres user.', function() {
        var done = this.async(),
            data = buildArguments();
        handlers.dropUser(data, done);
    });

    /**
     *
     * grunt pgsqlfile --connection.password=pepe --connection.name=something \
     *       --connection.host=pepe.dev --connection.port=9090 --connection.user=menagerie \
     *       --filename='pepe.json'
     */
    grunt.registerTask('pg_sqlfile', 'Run a sql against a Postgres database', function() {
        var done = this.async(),
            data = buildArguments();
        handlers.sqlFile(data, done);
    });
};


function getCommandOptions(config){
    var argv = buildArguments(),
        defaults = {};

    var connectionId = config.models.connection;

    if(connectionId){
        defaults = config.connections[connectionId];
    }

    return extend({}, defaults, argv);
}

function buildArguments(defaults) {
    var args = process.argv.slice(3),
        K = require('gkeypath');

    var key, value,
        argv = args.reduce(function(out, option) {
            option = option.replace('--', '');

            key = option.split('=')[0];

            if (option.indexOf('=') === -1) value = true;
            else value = option.split('=')[1];

            value && (value = value.split(/,\s?/));

            if(value.length === 1) value = value[0];

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

function exec_db(connection, statement, done) {
    console.log('connection', connection);
    console.log('QUERY\n', statement);
    return done();

    var pg = require('pg');

    pg.connect(connection, function(err, client) {

        if (err) {
            pg.end();
            throw new Error(err);
        }

        // console.log(statement);
        client.query(statement, function(err, result) {
            if (err) {
                pg.end();
                throw err;
            }
            // console.log('Result:', result);

            done();
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

    function createUser(data, callback) {
        //http://www.postgresql.org/docs/current/static/sql-createuser.html

        var stmt = 'CREATE USER ' + data.user;

        if (data.roles) {
            stmt += ' ' + data.roles.join(', ');
        }

        if (data.password) {
            stmt += ' WITH PASSWORD \'' + data.password + '\'';
        }

        stmt += ';';

        if(data.superuser) {
            stmt += ' WITH superuser';
        }

        exec_db(data.connection, stmt, function(err, res) {
            grunt.log.writeln('Database user "' + data.user + '" created' + (data.roles ? ' with roles: ' + data.roles.join(', ') : '') + '.');
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

        exec_db(data.connection, stmt, function(err, res) {
            grunt.log.writeln('Database "' + data.name + '" created.');
            callback();
        });
    }

    function assignOwner(data, callback){
        var stmt = 'ALTER DATABASE ' + data.name + ' OWNER TO ' + data.owner;
        exec_db(data.connection, stmt, function(err, res) {
            grunt.log.writeln('Database "' + data.name + '" created.');
            callback();
        });
    }

    function dropDb(data, done){
        //http://www.postgresql.org/docs/current/static/sql-dropdatabase.html
        exec_db(data.connection, 'DROP DATABASE IF EXISTS ' + data.name + ';', function(err, res) {
            grunt.log.writeln('Database "' + data.name + '" dropped.');
            done();
        });
    }
    function dropUser(data, done){
        var stmt = 'DROP ROLE IF EXISTS ' + data.user;
        exec_db(data.connection, stmt, function(err, res) {
            grunt.log.writeln('Database user "' + data.user + '" dropped.');
            done();
        });
    }

    function sqlFile(data, done){
        var dataOut = data.stdout;
        var dataErr = data.stderr;

        var exec = require('child_process').exec;

        // var db = data.connection;
        var command = (data.password ? 'PGPASSWORD=\'' + data.password + '\'' : '') +
            ' psql ' +
            ' -d ' + data.database +
            (data.host ? ' -h ' + data.host : '' ) +
            ' -p ' + data.port +
            ' -U ' + data.user +
            ' -w ' +
            ' -f ' + data.filename;

        //TODO: Add --dry-run
        console.log(grunt.template.process(command));
        return done();

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



