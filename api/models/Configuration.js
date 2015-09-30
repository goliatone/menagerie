/**
* Configuration.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      uuid : {
          type: 'string'
          /*, required: true*/,
          // index: { unique: true, sparse: true }
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
  }
};
