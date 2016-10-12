'use strict';

/**
* Device.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var extend = require('gextend');
var BaseModel = require('../../lib/BaseModel');

var Device = {
    autoPK: true,
    nicename: 'Device',
    attributes: {
        /*
        * uuid either generated from by the system or
        * imported during creation.
        */
        uuid: {
            type: 'string',
            // primaryKey: true,
            // required: true
        },
        /**
         * All devices carry an asset tag
         */
        assetTag: {
            type: 'string'
        },
        /*
        * If the device has some means of unique
        * identification other than a UUID, like:
        * gimbal beacons: UX33-NAEYZ
        * ESP8266: 91245
        * It should be unique within a device type
        * but not necessarily within a device instance.
        */
       //alias
        deviceId: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        status: {
            type: 'string',
            defaultsTo:'unknown',
            enum: [
                //initial state, as entered into the system
                //auto: default
                'unknown',
                //We make it available when we register the
                //device into a warehousing location
                //manual:√ Phone app ingestion | Web panel
                'available',
                //when it get's assigned to a deployment
                //auto:Deployment Process
                'reserved',
                //when it gets deployed, UPDATE LOCATION
                //auto:√ Phone app process | Web panel
                'deployed',
                //manually set to broken
                'broken'
            ]
        },
        type: {
            model:'deviceType'
        },
        location: {
            model: 'location'
        },
        //TODO: we might want to move this to DeployedDevice
        coordinates:{
            type: 'json'
        },
        metadata: {
            type:'json'
        }
    },
    beforeCreate: function(record, done){
        if(!record || !record.uuid){
            record.uuid = BaseModel.generateUUID();
        }
        done();
    },
    afterCreate: function(record, done){

        if(!record || !record.uuid){
            console.error('THIS SHOULD NEVER HAPPEN. We cannot have a Location instance without an UUID');
            return done();
        }

        var url = record.uuid,
            filename = record.uuid;

        BarcodeService.createQRCode(url, filename).finally(function(){
            done();
        });
    },
    beforeUpdate: function(values, done){
        if(values.location) values.coordinates = null;
        done();
    }
};


module.exports = extend({}, BaseModel, Device);
