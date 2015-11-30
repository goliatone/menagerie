'use strict';

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


    grunt.registerTask('db:setup', 'Setup database', function(command) {
        var done = this.async();
        var name = grunt.option('name');
        var sails;
        var sailsConfig;

        if (!command) {
            usage(grunt);
            return done();
        }

        var args = buildArguments();
    });

    var _ = grunt.util._;

    /**
     * Create Postgres user:
     * ```
     * grunt pgcreateuser --user=peperone --password=Password --roles=SUPERUSER,LOGIN,REPLICATION
     * ```
     */
    grunt.registerTask('pg_createuser', 'Add a new Postgres user.', function() {
        //http://www.postgresql.org/docs/current/static/sql-createuser.html
    // grunt.registerMultiTask('pgcreateuser', 'Add a new Postgres user.', function() {
        var self = this;
        var data = buildArguments(self.data);
        var done = self.async();

        sailsLoader.loadUserConfig(function(err, out){
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
                done();
            });
        });
    });

    grunt.registerTask('pg_createdb', 'Create a new Postgres database.', function() {
        var self = this;
        var data = self.data;
        var done = self.async();

        sailsLoader.loadUserConfig(function(err, out){
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
                done();
            });
        });
    });


    grunt.registerTask('pg_owner', 'Change the owner of a Postgres database.', function() {
        var self = this;
        var data = self.data;
        var done = self.async();

        sailsLoader.loadUserConfig(function(err, out){
            var stmt = 'ALTER DATABASE ' + data.name + ' OWNER TO ' + data.owner;
            exec_db(data.connection, stmt, function(err, res) {
                grunt.log.writeln('Database "' + data.name + '" created.');
                done();
            });
        });
    });

    grunt.registerTask('pg_dropdb', 'Drop a Postgres database.', function() {
        var self = this;
        var done = this.async();
        var data = this.data;

        sailsLoader.loadUserConfig(function(err, out){
            //http://www.postgresql.org/docs/current/static/sql-dropdatabase.html
            exec_db(data.connection, 'DROP DATABASE IF EXISTS ' + data.name + ';', function(err, res) {
                grunt.log.writeln('Database "' + data.name + '" dropped.');
                done();
            });
        });
    });

    grunt.registerTask('pg_dropuser', 'Drop a Postgres user.', function() {
        var self = this;
        var data = self.data;
        var done = self.async();

        sailsLoader.loadUserConfig(function(err, out){
            var stmt = 'DROP ROLE IF EXISTS ' + data.user;

            exec_db(data.connection, stmt, function(err, res) {
                grunt.log.writeln('Database user "' + data.user + '" dropped.');
                done();
            });
        });
    });

    /**
     *
     * grunt pgsqlfile --connection.password=pepe --connection.name=something \
     *       --connection.host=pepe.dev --connection.port=9090 --connection.user=menagerie \
     *       --filename='pepe.json'
     */
    grunt.registerTask('pg_sqlfile', 'Run a sql against a Postgres database', function() {

        var done = this.async();

        sailsLoader.loadUserConfig(function(err, out){

            var connectionId = out.models.connection,
                db = {};

            if(connectionId){
                db = out.connections[connectionId];
            }

            var exec = require('child_process').exec;

            var data = buildArguments(db);
            var dataOut = data.stdout;
            var dataErr = data.stderr;

            // var db = data.connection;
            var command = (db.password ? 'PGPASSWORD=\'' + db.password + '\'' : '') +
                ' psql ' +
                ' -d ' + db.database +
                (db.host ? ' -h ' + db.host : '' ) +
                ' -p ' + db.port +
                ' -U ' + db.user +
                ' -w ' +
                ' -f ' + data.filename;

            //TODO: Add --dry-run
            console.log(grunt.template.process(command));
            return done();

            exec(grunt.template.process(command), data.execOptions, function(err, stdout, stderr) {
                if (stdout) {
                    if (_.isFunction(dataOut)) {
                        dataOut(stdout);
                    } else if (dataOut === true) {
                        grunt.log.write(stdout);
                    }
                }

                if (err) {
                    if (_.isFunction(dataErr)) {
                        dataErr(stderr);
                    } else if (data.failOnError === true) {
                        grunt.fatal(err);
                    } else if (dataErr === true) {
                        grunt.log.error(err);
                    }
                }

                done();
            });
        });//end us.loadUserConfig
    });
};

function buildArguments() {
    var args = process.argv.slice(3),
        K = require('gkeypath');

    var key, value,
        argv = args.reduce(function(out, option) {
            option = option.replace('--', '');

            key = option.split('=')[0];

            if (option.indexOf('=') === -1) value = true;
            else value = option.split('=')[1];

            value && (value = value.split(/,\s?/));

            K.set(out, key, value);

            return out;
        }, {});

    return argv;
}

function usage(grunt) {

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
