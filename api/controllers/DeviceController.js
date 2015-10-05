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

var Device = {
     manage: function(req, res){
         return Device.update({id: req.param('deviceId')},{
             location: req.param('locationId')
         }).then(function (record) {
             return res.redirect('device');
         }).catch(function (err) {
             console.error('Error on DeviceService.updateDevice');
             console.error(err);

             return Device.find().where({id: req.param('deviceId')}).then(function (record) {
                 if (record && record.length > 0) {
                     return res.view('device/edit', {
                         record: record[0],
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

module.exports = extend({}, BaseController, Device);
