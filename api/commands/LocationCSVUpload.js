'use strict';
var Keypath = require('gkeypath');
var AsyncTask = require('async-task');


function noopTx(data){return data;}

function handleLocationCSVUpload(f){
    console.log('- csv upload: FILE UPLOADED', f);
    if(!f || !f.files || f.files.length === 0) return;
    var file = f.files[0];

    if(file.type !== 'text/csv') return;

    var filepath = file.fd;

    var tx = Keypath.get(sails, 'config.uploads.csv.location', {transformation: noopTx});

    var task = new AsyncTask({
        doInBackground: tx.transformation
    });

    CSVService.toJSON(filepath).then(function(dataset){
        task.execute(dataset)
        .then(function( result ) {
            sails.log.info('- csv upload: RESULT after transformation', result);
            LocationService.preloadData(result, function(err, result){
                if(err) return notifyError('LocationService', err);
                sails.log.info('- csv upload: DONE!', err, result);
            });
        }).catch( function(err){
            notifyError('AsyncTask', err);
        });
    }).catch(function(err){
        notifyError('CSVService', err);
    });
}

module.exports =  {
    eventType: 'file:upload:location',
    handler: handleLocationCSVUpload
};

function notifyError(label, err){
    sails.io.emit('/files/upload/error', {entity: 'location', err: err});

    sails.log.error('%s: error uploading CSV file', label);
    sails.log.error(err.message);
    sails.log.error(err.stack);
}
