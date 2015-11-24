'use strict';

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
    preloadFromJSONExport: function(outputdir){
        //TODO: Ensure that we are following a schema
        console.log('Preload data from JSON Export');

        var datasource = getDataSource('location');

        module.exports.preloadData(datasource).then(function(){
            console.log('Complete');
        }).catch(function(err){
            console.log('Error');
        });
    }
};


function getDataSource(entity){
    var datasource = [],
        filepath = '../../data/seed/json/' + entity + '-import.json';;

    try {
        
        datasource = require(filepath);
    } catch(e){
        console.log('Error importing datasource: %s', filepath);
        return datasource;
    }
    return datasource;
}