'use strict';
var path = require('path');
var debug = require('debug')('hook:treehugger');

module.exports = function treehugger(sails){
    function reload(key, base){
        var filepath = path.join(base, key);
        delete require.cache[require.resolve(filepath)];
        sails.config[key] = require(filepath)[key];
        debug('Reloading %s key, from %s base...', key, base);
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
                envCheck: /dev/,
                reload: [
                    'passport',
                    'connections'
                ]
            }
        },
        ready: false,
        configure: function(){
            debug('hook configure', sails.config.treehugger);
        },
        initialize: function(done){
            //Only apply the hook on development environment
            var cf = sails.config;

            if( ! cf.treehugger.envCheck.exec(cf.environment)){
                debug('Environment not matched, return: %s !== %s', cf.environment, cf.treehugger.envCheck);
                return done();
            }

            var _FileFinder = require('filefinder');

            _FileFinder().find('.secrets', __dirname).on('loaded', function(data){
                debug('LOADED secrets %o\nADDING TO ENV:',  JSON.stringify(data, null, 4));

                loadEnvironmentVariables(data);

                //Reload config for specific file
                //TODO: Move to it's own file/hook
                var basePath = path.join(cf.appPath, 'config');
                cf.treehugger.reload.map(function(key){
                    reload(key, basePath);
                });
                console.log('JSON', JSON.stringify(sails.config.connections));
                done();
            }).once('error', function(e){
                debug('TreeHugger error %e', e);
                done();
            });
        }
    };
};
