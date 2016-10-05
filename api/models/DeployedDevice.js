'use strict';
/**
 * DeployedDevice.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
 var extend = require('gextend');
 var BaseModel = require('../../lib/BaseModel');
 var nicename = require('../../lib/nicenameGenerator').init();

var Model = {

    attributes: {
        uuid: {
            type: 'string',
            // primaryKey: true,
            required: true
        },
        nicename: {
            type: 'string',
            defaultsTo: function(){
                return nicename.generate();
            }
        },
        deployment: {
            model: 'deployment'
        },
        location: {
            model: 'location'
        },
        coordinates:{
            type: 'json'
        },
        configuration: {
            model: 'configuration'
        },
        state:{
            type: 'string',
            defaultsTo:'unseen',
            enum: [
                'unseen', //not seen yet
                'checkin', //checked in
                'online', //online health checkin
                'offline', //it was online, now it's missing
            ]
        }
    },
    afterUpdate: function(record, next){
        var update = {
            location: record.location,
            // coordinates: null
        };

        if(record.state === 'checkin') update.status = 'deployed';

        Device.update({uuid:record.uuid}, update).then(function(){
            next();
        }).catch(function(err){
            next(err);
        });
    },
    createFromDevice: function(records, deployment){

        var deployed = records.map(function(record){
            return {
                uuid: record.uuid,
                deployment: deployment
            };
        });
        console.log('- createFromDevice: ', deployed);
        return DeployedDevice.create(deployed).then(function(devices){
            return devices;
        });
    },

};


module.exports = extend({}, BaseModel, Model);
