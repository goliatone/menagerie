'use strict';
var path = require('path');
var debug = require('debug')('hook:treehugger');

module.exports = function treehugger(sails){
    function reload(key, base){
        var filepath = path.join(base, key);
        delete require.cache[require.resolve(filepath)];
        sails.config[key] = require(filepath)[key];
    }

    function loadEnvironmentVariables(data){
        Object.keys(data).map(function(k){
            debug('KEY %s VALUE %s', k, data[k]);
            process.env[k] = data[k];
        });
    }

    return {
        defaults: {
            treehugger: {
                // basePath: ''
                reload: [
                    'passport'
                ]
            }
        },
        ready: false,
        configure: function(){
            debug('hook configure', sails.config.treehugger);
        },
        initialize: function(cb){
            //Only apply the hook on development environment
            if(/production/.exec(sails.config.environment)) return cb();

            var _FileFinder = require('filefinder');

            _FileFinder().find('.secrets', __dirname).on('loaded', function(data){
                debug('LOADED secrets %o\nADDING TO ENV:',  JSON.stringify(data, null, 4));

                loadEnvironmentVariables(data);

                //Reload config for specific file
                //TODO: Move to it's own file/hook
                var basePath = path.join(sails.config.appPath, 'config');
                sails.config.treehugger.reload.map(function(key){
                    reload(key, basePath);
                });

                cb();

            }).once('error', function(e){
                cb();
            });
        }
    };
};
