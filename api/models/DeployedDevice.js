'use strict';
/**
 * DeployedDevice.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
 var extend = require('gextend');
 var BaseModel = require('../../lib/BaseModel');

var Model = {

    attributes: {
        uuid: {
            type: 'string',
            // primaryKey: true,
            required: true
        },
        deployment: {
            model: 'deployment'
        },
        location: {
            model: 'location'
        },
        state:{
            type: 'string',
            defaultsTo:'unseen',
            enum: [
                'unseen', //not seen yet
                'online', //online health checkin
                'offline', //it was online, now it's missing
            ]
        }
    },
    createFromDevice: function(records, deployment){

        var deployed = records.map(function(record){
            return {
                deployment: deployment,
                uuid: record.uuid
            };
        });
        console.log('- createFromDevice: ', deployed);
        return DeployedDevice.create(deployed).then(function(devices){
            return devices;
        });
    }
};


module.exports = extend({}, BaseModel, Model);
