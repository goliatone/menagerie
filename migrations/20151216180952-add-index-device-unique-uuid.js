'use strict';

var dbm;
var type;
var seed;
var TABLE;
var KEY;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;

    TABLE = 'device';
    KEY = 'device_uuid_unique';
};

exports.up = function(db, callback) {
    db.addIndex(TABLE, KEY, ['uuid'], true, callback);
};

exports.down = function(db, callback) {
    db.removeIndex(TABLE, KEY, callback);
};
