/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {
/*
ngrok http port -subdomain=subdomain

    var localtunnel = require('localtunnel');

    var port = sails.config.port;
    var tunnel = localtunnel(port, {
        subdomain: 'menagerie'
    }, function(err, tunnel) {
        if (err) console.log('ERROR')

        // the assigned public url for your tunnel
        // i.e. https://abcdefgjhij.localtunnel.me
        console.log(tunnel.url);
    });

    tunnel.on('close', function() {
        // tunnels are closed
    });
*/
    var AsyncTask = require( 'async-task' )

    sails.on('file:upload', function(f){
        console.log('FILE UPLOADED', f);

        var task = new AsyncTask({
            doInBackground: function(data){
                var out = [], uuid = require('random-uuid-v4');
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
        });

        CSVService.toJSON(f.files[0].fd).then(function(dataset){
            task.execute(dataset)
            .then(function( result ) {
                console.log('RESULT', result);
                LocationService.preloadData(result, function(err, result){
                    console.log('DONE!');
                });
            })
            .catch( function(){
                console.log('error');
            });
        });
    });

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};
