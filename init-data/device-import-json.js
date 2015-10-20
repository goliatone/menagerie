'use strict';
var uuid = require('random-uuid-v4');


var locations = require('./device-export.json');

var out = [], record;
locations.map(function(loc){
    record = {
        type: 1,
        status: 'not_inuse',
        model: loc.model,
        manufacturer: loc.manufacturer,
        assetTag: pad(loc.assetTag, 6),
        description: loc.description,
        metadata: {
            serialNumber: loc.metadata.serialNumber
        }
    };

    if(!record.uuid) record.uuid = uuid();
    record.uuid = record.uuid.toUpperCase();

    out.push(record);
});

console.log(JSON.stringify(out, null, 4));


function pad(char, len){
    if(char.length > len) return char;

    var mask = (Array.apply(null, new Array(len))).reduce(function(c){
        return c + '0';
    }, '');

    return (mask + char).slice(-1 * mask.length);
}
