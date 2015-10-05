/**
* DeviceType.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

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
    getParametersFromRequest: function(req){
        // req.params.all()
        var record = {},
            value;

        Object.keys(DeviceType.attributes).map(function(key){
            value = req.param(key);
            if(!value) return;
            record[key] = value;
        });

        return record;
    },
    findByIdFromRequest: function(req){
        var pk = DeviceType.primaryKey;
        var query = {};
        query[pk] = req.param(pk);
        //We should use findOne()
        return DeviceType.find().where(query);
    }
};
