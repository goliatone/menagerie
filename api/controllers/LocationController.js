'use strict';

/**
 * LocationController
 *
 * @description :: Server-side logic for managing locations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var BaseController = require('../../lib/BaseController')('Location');
var debug = require('debug')('controller:Location');
var extend = require('gextend');

var Controller = {
    devices: function(req, res){
        var id = req.param('id');
        Location.findOne({id: id}).populateAll().then(function(location){

            var features = [], detached = [];

            (location.devices || []).map(function(device){
                if(!device.coordinates) return detached.push({id: device.id, name: device.name, status: device.status});
                features.push({
                    id: device.id,
                    name: device.name,
                    coordinates: device.coordinates,
                    status: device.status //we should use DeployedDevice
                });
            });

            res.ok({
                record: location,
                title: 'Location Devices',
                features: features,
                detached: detached
            }, BaseController.Resource.getViewPath('devices'));
        }).catch(function(err){
            res.sendError(err);
        });
    },
    features: function(req, res){

    }
};

module.exports = extend({}, BaseController, Controller);
