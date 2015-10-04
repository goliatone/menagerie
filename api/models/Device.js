/**
* Device.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    autoPK: true,
    attributes: {
        uuid: {
            type: 'string',
            // primaryKey: true,
            // required: true
        },
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        status: {
            type: 'string'
        },
        type: {
            model:'deviceType'
        },
        location: {
            model: 'location'
        },
        configuration: {
            model: 'configuration'
        }
    },
    getParametersFromRequest: function(req){
        var record = {},
            value;

        Object.keys(Device.attributes).map(function(key){
            value = req.param(key);
            if(!value) return;
            record[key] = value;
        });
        return record;
    },
    findByIdFromRequest: function(req){
        var pk = Device.primaryKey;
        var query = {};
        query[pk] = req.param('id');
        //We should use findOne()
        return Device.find().where(query);
    }
};
