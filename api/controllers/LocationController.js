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
            function getLabel(device){
                return device.name || device.assetTag || device.deviceId || device.uuid;
            }
            (location.devices || []).map(function(device){
                if(!device.coordinates) return detached.push({id: device.id, name: getLabel(device), status: device.status});
                features.push({
                    id: device.id,
                    name: getLabel(device),
                    coordinates: device.coordinates,
                    status: device.status //we should use DeployedDevice
                });
            });

            res.ok({
                record: location,
                title: 'Location Devices',
                features: features,
                detached: detached,
                nicename: 'location',
            }, BaseController.Resource.getViewPath('devices'));
        }).catch(function(err){
            console.error('ERROR: ', err.message);
            console.error(err.stack);
            res.sendError(err);
        });
    }
};

module.exports = extend({}, BaseController, Controller);
