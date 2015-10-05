/**
* DeviceType.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var parseModel = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil').parseModel;
module.exports = {
    autoPK: true,
    nicename: 'DeviceType',
    attributes: {
        name : {
            type: 'string',
            // primaryKey: true,
            // required: true
        },
        description : {
            type: 'string'
        },
        label : {
            type: 'string',
            //   trim: true, index: true
        },
        metadata : {
            type: 'json'
        },
        devices: {
            collection: 'device',
            via: 'type'
        }
    },
    getEmptyObject: function(req){
        var Model = parseModel(req);
        var record = {},
            value;

        Object.keys(Model.attributes).map(function(key){
            record[key] = null;
        });
        record.uuid = uuid().toUpperCase();
        return record;
    },
    getParametersFromRequest: function(req){
        var Model = parseModel(req);
        var record = {},
            value;

        Object.keys(Model.attributes).map(function(key){
            value = req.param(key);
            if(!value) return;
            record[key] = value;
        });
        return record;
    },
    findByIdFromRequest: function(req){
        var Model = parseModel(req);
        var pk = Model.primaryKey;
        var query = {};
        query[pk] = req.param(pk);

        return Model.findOne(query);
    }
};
