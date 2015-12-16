'use strict';

var dbm;
var type;
var seed;
var TABLE;
var IKEY;
var CKEY;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;

    TABLE = 'location';
    CKEY = 'location_uuid_unique';
    IKEY = 'location_uuid_index';
};

exports.up = function(db, callback) {
    // db.addIndex(TABLE, IKEY, ['uuid'], true, callback);
    var sql = 'ALTER TABLE ONLY "?"  ADD CONSTRAINT ? UNIQUE (uuid);CREATE INDEX ? ON ? USING btree (uuid);',
        params = [TABLE, CKEY, IKEY, TABLE];

    db.runSql(sql, params, callback);
};

exports.down = function(db, callback) {
    var sql = 'ALTER TABLE ONLY "?" DROP CONSTRAINT IF EXISTS ?; DROP INDEX IF EXISTS ?;',
        params = [TABLE, CKEY, IKEY];

    db.runSql(sql, params, callback);
};
