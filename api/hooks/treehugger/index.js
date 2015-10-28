'use strict';
var path = require('path');

module.exports = function treehugger(sails){
    console.log('HOOK HOOK!');
    console.log('ENV', sails.config.environment);
    console.log('ENV', sails.config);

    function reload(key, base){
        var filepath = path.join(base, key);
        delete require.cache[require.resolve(filepath)];
        sails.config[key] = require(filepath)[key];
    }

    function loadEnvironmentVariables(data){
        Object.keys(data).map(function(k){
            console.log('KEY %s VALUE %s', k, data[k]);
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
            console.log('hook configure', sails.config.treehugger);
        },
        initialize: function(cb){
            //Only apply the hook on development environment
            if(sails.config.environment !== 'development')return cb();

            var FileFinder = require('filefinder');

            FileFinder().find('.secrets', __dirname).on('loaded', function(data){
                console.log('LOADED secrets %o\nADDING TO ENV:', typeof data);

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
