'use strict';
var toolbar = require('express-debug');
var debug = require('debug')('hook:debugtoolbar');

module.exports = function treehugger(sails){

    return {
        ready: false,
        initialize: function(done){
            
            var envCheck = sails.config.environment === 'production';

            sails.newRelicBrowserHeader = function(){
                if(envCheck) sails.newrelic.getBrowserTimingHeader();
            };

            if(!envCheck) return done();

            sails.newrelic = global.newrelic;
            delete global.newrelic;
            sails.on('router:route', function(route){
                if(sails.newrelic && route.req.options && route.req.options.controller){
                    return sails.newrelic.setControllerName(route.req.options.controller, route.req.options.action);
                }
            });
            return done();
        }
    };
};
