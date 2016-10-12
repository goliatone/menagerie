'use strict';

var Converter = require('csvtojson').Converter;
var converter = new Converter({});
var Promise = require('bluebird');

module.exports = {
    //todo, add as background job to tie in CSV upload
    //and file conversion.
    toJSON: function(filepath){

        var result = new Promise(function(resolve, reject){
            var out = [];
            converter.on('record_parsed', function(record){
                //here we should clean up our keys.
                out.push(record);
            });

            converter.on('end_parsed', function(json){
                resolve(out);
            });
            converter.on('error', function(err){
                reject(err);
            });
        });

        //handle errors here
        require('fs').createReadStream(filepath).pipe(converter);

        return result;
    }
};
