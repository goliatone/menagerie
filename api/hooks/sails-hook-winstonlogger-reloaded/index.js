'use strict';

var winston = require('winston'),
    captain = require('sails/node_modules/captains-log'),
    buildShipFn = require('sails/lib/hooks/logger/ship');

module.exports = function winstonlogger(sails) {

    return {
        ready: false,

        initialize: function(done){
            var log,
                logger,
                captainsOptions = sails.config.log,
                consoleOptions = {
                    level: sails.config.log.level,
                    formatter: function(options) {
                        var message = sails.config.log.timestamp ? new Date().toLocaleString() + ' ' : '';
                        message += options.message || '';
                        message += (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
                        return message;
                    }
                };

            // Console Transport
            logger = new winston.Logger({transports: [new winston.transports.Console(consoleOptions)]});

            var transports = captainsOptions.transports;
            // Custom Transport
            // More information: https://github.com/winstonjs/winston/blob/master/docs/transports.md
            if (Array.isArray(transports) && transports.length > 0) {
                transports.forEach(function(transport){
                    if(transport.hasOwnProperty('enabled') && !transport.enabled) return;
                    logger.add(transport.module, transport.config || {});
                });
            }

            sails.config.log.custom = logger;
            captainsOptions.custom = logger;

            log = captain(captainsOptions);
            log.ship = buildShipFn(sails.version ? ('v' + sails.version) : '', log.info);
            sails.log = log;

            return done();
        }
    };
};
