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
    },
    preloadFromJSONExport: function(){
        //TODO: Ensure that we are following a schema
        console.log('Preload data from JSON Export');

        var datasource = {locations:[]};

        try {
            datasource = require('../../init-data/location-export-json');
        } catch(e){
            console.log('Error importing datasource');
            return;
        }

        var data = [], record;
        datasource.locations.map(function(raw){
            data.push({
                uuid: raw.roomUuid.toUpperCase(),
                name: [raw.bldg, pad(raw.level, 3), raw.roomNumber].join('-'),
                description: 'Room Number ' + raw.roomNumber + ', cable id ' + raw.cableId
            });
        });

        function pad(char, len){
            var mask = '000';
            return (mask + char).slice(-1 * mask.length);
        }

        console.log('data: ', data);
        console.log('Preloading data...');
        module.exports.preloadData(data).then(function(){
            console.log('Complete');
        }).catch(function(err){
            console.log('Error');
        });
    }
};
