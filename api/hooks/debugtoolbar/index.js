'use strict';
var toolbar = require('express-debug');
var debug = require('debug')('hook:debugtoolbar');

module.exports = function treehugger(sails){

    return {
        defaults: {
            toolbar: {
                envCheck: /prod/,
                options: {
                    depth:4,
                    extra_panels:[],
                    panels:['locals', 'request', 'session', 'template', 'software_info', 'profile'],
                    path: '/express-debug',
                    extra_attrs: '',
                    sort: false
                    // theme: <absoulte path to a CSS file>
                }
            }
        },
        configure: function(){
            debug('hook configure', sails.config.toolbar);
        },
        initialize: function(done){

            var cf = sails.config;

            if(cf.toolbar.envCheck.exec(cf.environment)){
                debug('Environment matched, return: %s !== %s', cf.environment, cf.toolbar.envCheck);
                return done();
            }

            toolbar(sails.hooks.http.app, cf.toolbar.options);

            done();
        }
    };
};
