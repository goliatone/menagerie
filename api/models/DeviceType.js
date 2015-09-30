/**
* DeviceType.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    attributes: {
        name : {
            type: 'string'
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
        devices:{
            collection: 'device',
            via: 'type'
        }
    }
};
