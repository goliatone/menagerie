'use strict';
/**
 * ConfigurationController
 *
 * @description :: Server-side logic for managing configurations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var BaseController = require('../../lib/BaseController')('DeployedDevice');
var debug = require('debug')('controller:DeployedDevice');
var extend = require('gextend');

var Controller = {
/******************************************************
 * DeployedDevice
 ******************************************************/
    countDevices: function(req, res){
        var id = req.param('deployment');
        console.log('count', {deployment:id});

        var skip = BaseController.Resource.actionUtil.parseSkip(req);
        var step = req.query.limit || sails.config.blueprints.clietRecordLimit || 10;
        DeployedDevice.count({deployment:id}).then(function(total){
            res.ok({
                count: total,
                skip: skip,
                step: step
            });
        }).catch(function(err){
            res.serverError(err);
        });
    },
    findall: function(req, res){
        var deployment = req.param('deployment');

        var Model = BaseController.Resource.getModel();
        debug('Inside findall..............');

        if(!req.options.hasOwnProperty('limit') && !req.wantsJSON){
            req.options.limit = (sails.config.blueprints.clietRecordLimit || 10);
        }

        var criteria = BaseController.Resource.actionUtil.parseCriteria(req);

        if(deployment) criteria = {where:{deployment: deployment}};
        //TODO: Check to see if we have pk
        var query = Model.find()
            .where(criteria)
            .limit(BaseController.Resource.actionUtil.parseLimit(req))
            .skip(BaseController.Resource.actionUtil.parseSkip(req))
            .sort(BaseController.Resource.actionUtil.parseSort(req));

        // query = BaseController.Resource.populateEach(query, req);

        query.populateAll();

        console.log('CRITERIA', criteria);

        query.exec(function found(err, matchingRecords){
            console.log('------------');
            console.log(matchingRecords.length);
            console.log(matchingRecords);
            console.log('------------');
            if(err) return res.negotiate(err);
            if(req._sails.hooks.pubsub && req.isSocket){
                Model.subscribe(req, matchingRecords);
                if(req.options.autoWatch) { Model.watch(req);}
                (matchingRecords || []).map(function(record){
                    BaseController.Resource.actionUtil.subscribeDeep(req, record);
                });
            }

            res.ok({
                status: 'OK',
                title: 'List of records',
                nicename: BaseController.Resource.nicename,
                records: matchingRecords,
                criteria: criteria || {},
                deploymentId: deployment
            }, BaseController.Resource.getViewPath('list'));
         });
    }
};

module.exports = extend({}, BaseController, Controller);
