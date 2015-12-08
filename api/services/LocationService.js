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
        var datasource = getDataSource('location');
        module.exports.preloadData(datasource, cb);
    },
    preloadFromJSONExport: function(outputdir){
        //TODO: Ensure that we are following a schema
        console.log('Preload data from JSON Export');

        var datasource = getDataSource('location');

        console.log('data: ', datasource);
        console.log('Preloading data...');

        module.exports.preloadData(datasource).then(function(){
            console.log('Complete');
        }).catch(function(err){
            console.log('Error');
        });
    },
    generateSeedFromData: function(filename){
        filename = filename || 'location_seed.json';

        console.log('>>>>>>>>>>> Generating data <<<<<<<<<<<');
        return Location.find().then(function(records){
            console.log(records);
            if(!records) records = [];

            var fs = require('fs');

            records.map(function(item){
                delete item.createdAt;
                delete item.updatedAt;
            });

            fs.writeFileSync(filename, JSON.stringify(records));
        }).catch(function(err){
            console.log('Error on LocationService.generateSeedFromData');
            console.log(err.message);
            return err;
        });
    }
};

function getDataSource(entity){
    var datasource = [],
        filepath = '../../data/seed/json/' + entity + '-import.json';

    try {
        datasource = require(filepath);
    } catch(e){
        console.log('Error importing datasource: %s', filepath);
        return datasource;
    }
    return datasource;
}
