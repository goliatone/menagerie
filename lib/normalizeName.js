'use strict';

module.exports = function normalizeName(name){
    var slug = require('slug');
    return slug(name, {lower:true});
};
