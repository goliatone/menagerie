/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * http://sailsjs.org/#!/documentation/concepts/Logging
 */
'use strict';

var path = require('path'),
  pkgJSON = require(path.resolve('package.json')),
  df = require('date-formatter');

module.exports.log = {

  /***************************************************************************
  *                                                                          *
  * Valid `level` configs: i.e. the minimum log level to capture with        *
  * sails.log.*()                                                            *
  *                                                                          *
  * The order of precedence for log levels from lowest to highest is:        *
  * silly, verbose, info, debug, warn, error                                 *
  *                                                                          *
  * You may also set the level to "silent" to suppress all logs.             *
  *                                                                          *
  ***************************************************************************/

  level: 'info',
  enabled: true,
  timestamp: true,
  colorize: false,
  prettyPrint: true,

  transports: [
    {
      module: require('winston-daily-rotate-file'),
      enabled: Boolean((process.env.NODE_ENV || '').match(/production|staging/)),
      config: {
        dirname: path.resolve('logs'),
        datePattern: 'yyyy-MM-dd.log',
        filename: pkgJSON.name,
        timestamp: true,
        colorize: false,
        maxsize: 1024 * 1024 * 10,
        json: false,
        prettyPrint: true,
        depth: 10,
        tailable: true,
        zippedArchive: true,
        level: 'silly'
      }
    },
    {
      //TODO: For now, this is goliatone's fork
      module: require('winston-cloudwatch'),
      enabled: process.env.NODE_ENV === 'production',
      config: {
        logGroupName: pkgJSON.name + '-' +process.env.NODE_ENV,
        logStreamName: makeLogStreamName(),
        awsAccessKeyId: process.env.NODE_AWS_ACCESS_KEY_ID,
        awsSecretKey: process.env.NODE_AWS_SECRET_ACCESS_KEY,
        awsRegion: process.env.NODE_AWS_REGION || 'us-east-1'
      }
    },
    {
      module: require('winston-honeybadger'),
      enabled: process.env.NODE_ENV === 'production',
      config: {
        apiKey: process.env.NODE_HONEYBADGER_KEY
      }
    }
  ]
};

function makeLogStreamName() {
    return df(new Date(), 'YYYY/MM/DD');
}
