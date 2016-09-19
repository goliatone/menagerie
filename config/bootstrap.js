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
    // var package = require()
    var join = require('path').join;
    try {
        sails.config.package = require(join(sails.config.appPath, 'package.json'));
    } catch(e){}
    //Load all passport strategies
    sails.services.passport.loadStrategies();

    console.log('=============================');
    console.log('|');
    console.log('| ENV STUFF:');
    console.log('| RUNTIME_ENVIRONMENT:', process.env.NODE_ENV);
    console.log('|');
    console.log('| POGSTRESS STUFF:');
    console.log('| POSTGRES_PORT_5432_TCP_ADDR:', process.env.POSTGRES_PORT_5432_TCP_ADDR);
    console.log('| POSTGRES_PORT_5432_TCP_PORT:', process.env.POSTGRES_PORT_5432_TCP_PORT);
    console.log('| POSTGRES_USER:', process.env.POSTGRES_USER);
    console.log('| POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
    console.log('|');
    console.log('=============================');

    /*
     * Intercept all file uploads, we care about csv files.
     * We are triggering a custom event "file:upload" in FileController.
     */
    var locationCSVUpload = require('../api/commands/LocationCSVUpload');
    sails.on(locationCSVUpload.eventType, locationCSVUpload.handler);

    /*
     * After files have been uploaded, we create a new Files record.
     */
    var fileUpload = require('../api/commands/CreateFileFromUploadCommand');
    sails.on(fileUpload.eventType, fileUpload.handler);

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};
