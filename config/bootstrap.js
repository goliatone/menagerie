'use strict';

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
    var port = sails.config.port;

    console.log('=============================');
    console.log('NGROK CMD: ', 'ngrok http '+ port + ' -subdomain=menagerie');

    var ngrok = require('ngrok-daemon');

    ngrok.start('ngrok http '+ port + ' -subdomain=menagerie') // Port
    .then(function(tunnel) {
        // Tunnel has three propeties:
        // - url - URL to the started tunnel
        // - pid - process id of ngrok (PID)
        // - log - path to ngrok log in temporary directory
        console.log('Ngrok started:', tunnel);
    }).catch(function() {
        // Failed to start ngrok on given port (eg ngrok is not installed)
        console.log('FAILED')
    });

    console.log('=============================');
    console.log('|');
    console.log('| POGSTRESS STUFF:');
    console.log('| POSTGRES_PORT_5432_TCP_ADDR:', process.env.POSTGRES_PORT_5432_TCP_ADDR);
    console.log('| POSTGRES_PORT_5432_TCP_PORT:', process.env.POSTGRES_PORT_5432_TCP_PORT);
    console.log('| POSTGRESQL_USER:', process.env.POSTGRESQL_USER);
    console.log('| POSTGRESQL_PASSWORD:', process.env.POSTGRESQL_PASSWORD);
    console.log('|');
    console.log('=============================');

    var locationCSVUpload = require('../api/commands/LocationCSVUpload');
    sails.on(locationCSVUpload.eventType, locationCSVUpload.handler);

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};
