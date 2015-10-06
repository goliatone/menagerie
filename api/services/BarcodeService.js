'use strict';
var Promise = require('bluebird');

var qr = require('qrcodeine'),
    fs = Promise.promisifyAll(require("fs")),
    extend = require('gextend');

var DEFAULTS = {
    dotSize: 20,
    foregroundColor: 0xFFFFFF,
    backgroundColor: 0x000000
};

module.exports = {
    createQRCode: function(content, filename, options){
        options = extend({}, DEFAULTS, options);

        var img = qr.encodePng(content, options);
        var uri = '/images/qrs/' + filename + '.png';

        return fs.writeFile('./assets' + uri, img.data);
    }
};
