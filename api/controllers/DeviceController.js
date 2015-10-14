'use strict';
/* jshint global Device */
/**
 * DeviceController
 *
 * @description :: Server-side logic for managing devices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var BaseController = require('../../lib/BaseController')('Device');
 var debug = require('debug')('controller:Device');
 var extend = require('gextend');

var Controller = {
    manage: function(req, res){

        var payload = {
            deviceId: req.param('deviceId'),
            locationId: req.param('locationId')
        };

        var devQuery = {
            id: payload.deviceId
        };

        if(typeof payload.deviceId === 'string'){
            delete devQuery.id;
            devQuery.where = { uuid: payload.deviceId };
        }

        var locQuery = {
            id: payload.locationId
        };

        if(typeof payload.locationId === 'string'){
            delete locQuery.id;
            locQuery.where = {uuid: payload.locationId};
        }

        console.log('QUERY', locQuery, devQuery);

        Location.findOne(locQuery).then(function(location){
            Device.update(devQuery, {
                location: location.id
            }).then(function (record) {
                //This should actually be a regular Device update socket event...
                sails.sockets.blast('/things/pair/true', {ok:true, device:record[0], location: location});

                return res.redirect('device');
            }).catch(function(err){
                return err;
            });
        }).catch(function(err){
            return Device.findOne({id: req.param('deviceId')}).then(function (record) {
                if (record) {
                    return res.view('device/edit', {
                        record: record,
                        status: 'Error',
                        errorType: 'validation-error',
                        statusDescription: err,
                        title: 'Device Details'
                    });
                } else {
                    return res.ok({message: 'Sorry, no resource found with id - ' + req.param('id')}, '500');
                }
            }).catch(function (err) {
                return res.ok({message: 'Sorry, no resource found with id - ' + req.param('id')}, '500');
            });
        });
     }
 };

module.exports = extend({}, BaseController, Controller);
