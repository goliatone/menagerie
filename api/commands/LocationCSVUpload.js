'use strict';

var AsyncTask = require('async-task');


function backgroundTask(data){
    var out = [],
        uuid = require('random-uuid-v4');
    if(Array.isArray(data)){
        data.map(function(record){
            // { Type: 'R710',
            // Level: 27,
            // 'Room Name / Type': 'CORRIDOR',
            // 'Room Number': 2700,
            // 'Port 1 ID': '27-010-W',
            // 'Port 2 ID': '27-011-W',
            // 'Natural Key': 'NY13-027-2700' }
            var obj = {};
            obj.uuid = uuid();
            obj.name = record['Natural Key'];
            obj.description = record['Room Name / Type'] + ' ' + record['Room Number'];
            if(obj.name && obj.name.length) out.push(obj);
        });
    }
    console.log('UPLOADING CSV DATA', out);
    return out;
}

function handleLocationCSVUpload(f){
    console.log('- csv upload: FILE UPLOADED', f);
    var file = f.files[0];

    if(file.type !== 'text/csv') return;

    var filepath = file.fd;

    var task = new AsyncTask({
        doInBackground: backgroundTask
    });


    CSVService.toJSON(filepath).then(function(dataset){
        task.execute(dataset)
        .then(function( result ) {
            console.log('- csv upload: RESULT', result);
            LocationService.preloadData(result, function(err, result){
                console.log('- csv upload: DONE!');
            });
        })
        .catch( function(){
            console.log('error');
        });
    });
}

module.exports =  {
    eventType: 'file:upload',
    handler: handleLocationCSVUpload
};
