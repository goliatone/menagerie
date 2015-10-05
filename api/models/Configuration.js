/**
* Configuration.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    autoPK: true,
    attributes: {
        uuid : {
            type: 'string'
            // primaryKey: true,
            // required: true
        },
        name : {
            type: 'string'
        },
        description : {
            type: 'string'
        },
        device: {
            model: 'device'
        },
        data: {
            type: 'json'
        }
    },
    updateOrCreate: function (id, pojo) {
        return Configuration.update({id: id}, pojo).then(function(ua){
            if(ua.length === 0){
                // No records updated, UserAddress does not exist. Create.
                return Configuration.create(pojo);
            }
        });
    }
};
