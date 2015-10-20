'use strict';
var uuid = require('random-uuid-v4');

var datasource = require('../../init-data/device-import.json');
//import contactsList from '/init-data/contacts';

module.exports = {
    preloadData: function (data, cb) {
        console.log('>>>>>>>>>>>>>>> preloading data.......');

        return Device.findOrCreateEach(['uuid'], data).then(function (records) {
            console.log('Location created: ' + JSON.stringify(records));
            if (cb) cb(null, records);
            return records;
        }).catch(function (err) {
            console.error('Error on Device.preloadData');
            console.error(err);
            // console.error(JSON.stringify(err));
            if(cb) cb(err, null);
            return err;
        });
    },
    preloadDataFromSeed:function(cb){
        module.exports.preloadData(datasource, cb);
    },
    preloadFromJSONExport: function(){
        //TODO: Ensure that we are following a schema
        console.log('Preload data from JSON Export');

        var datasource = [];

        try {
            datasource = require('../../init-data/device-import.json');
        } catch(e){
            console.log('Error importing datasource');
            return;
        }

        //Here we assume that all devices are of the same type:

        console.log('data: ', datasource);
        console.log('Preloading data...');
        module.exports.preloadData(datasource).then(function(){
            console.log('Complete');
        }).catch(function(err){
            console.log('Error');
        });

    }
};
