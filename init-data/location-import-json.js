'use strict';

var locations = [];

try {
    locations = require('./location-import.json');
} catch(e){}

module.exports = {
    locations: locations
};
