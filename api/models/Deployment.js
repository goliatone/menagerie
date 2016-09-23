'use strict';

/**
 * Deployment.js
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
            unique: true,
            required: true,
            defaultsTo: function(){
                return BaseModel.generateUUID();
            }
        },
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        startDate: {
            type: 'date'
        },
        endDate: {
            type: 'date'
        },
        location:{
            model: 'location'
        },
        devices: {
            collection: 'deployeddevice',
            via: 'deployment'
        }
    }
};

module.exports = extend({}, BaseModel, Model);
