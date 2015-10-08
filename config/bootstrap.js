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

    var localtunnel = require('localtunnel');
    var port = 1337;//sails.config.local.port;
    var tunnel = localtunnel(port, {subdomain:'menagerie'}, function(err, tunnel) {
        if (err) console.log('ERROR')

        // the assigned public url for your tunnel
        // i.e. https://abcdefgjhij.localtunnel.me
        console.log(tunnel.url);
    });

    tunnel.on('close', function() {
        // tunnels are closed
    });

    sails.on('file:upload', function(f){
        console.log('FILE UPLOADED', f);
        CSVService.toJSON(f.files[0].fd);
    });

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};
