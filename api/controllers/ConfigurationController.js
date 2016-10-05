'use strict';
/**
 * ConfigurationController
 *
 * @description :: Server-side logic for managing configurations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var BaseController = require('../../lib/BaseController')('Configuration');
 var debug = require('debug')('controller:Configuration');
 var extend = require('gextend');

 var Controller = {
    deviceConfig: function(req, res){

        var term = req.param('term');

        DeployedDevice.findOne({
            where:{
                or:[
                    {id: term},
                    {uuid: term},
                ]
            }
        }).populate('configuration').then(function(record){
            res.ok({
                type: 'configuration',
                success: true,
                result: record.configuration || {}
            });
        }).catch(function(err){
            sails.log.error('ConfigurationController:deviceConfig');
            sails.log.error(err.message);
            sails.log.error(err.stack);

            res.sendError(err);
        });
     }
 };

 module.exports = extend({}, BaseController, Controller);
