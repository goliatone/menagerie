/**
* Sublocation.js
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
        }
    }
};
