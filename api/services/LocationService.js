'use strict';

var datasource = require('../../init-data/location.js');
//import contactsList from '/init-data/contacts';

module.exports = {
    preloadData: function (data, cb) {
        console.log('>>>>>>>>>>>>>>> preloading data.......');

        return Location.findOrCreateEach(['uuid'], data).then(function (records) {
            console.log('Location created: ' + JSON.stringify(records));
            if (cb) cb(null, records);
            return records;
        }).catch(function (err) {
            console.error('Error on LocationService.preloadData');
            console.error(err);
            console.error(JSON.stringify(err));
            if(cb) cb(err, null);
            return err;
        });
    },
    preloadDataFromSeed:function(cb){
        module.exports.preloadData(datasource.records, cb);
    }
};
