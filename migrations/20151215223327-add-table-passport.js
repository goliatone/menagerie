'use strict';

var dbm;
var type;
var seed;
var TABLE;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;

    TABLE = 'passport';
};

exports.up = function(db, callback) {
    db.createTable(TABLE, {
        columns: {
            id: { type: type.INTEGER, primaryKey: true, autoIncrement: true },
            protocol: {type: 'text'},
            password: {type: 'text'},
            accessToken: {type: 'text'},
            provider: {type: 'text'},
            identifier: {type: 'text'},
            tokens: {type: 'json'},
            user: {type: 'int'},
            createdAt: { type: 'timestamp with time zone' },
            updatedAt: { type: 'timestamp with time zone' }
        },
        ifNotExists: true
    }, callback);
};

exports.down = function(db, callback) {
    db.dropTable(TABLE, callback);
};



