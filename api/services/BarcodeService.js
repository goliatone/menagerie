'use strict';
var Promise = require('bluebird');

var qr = require('qrcodeine'),
    fs = Promise.promisifyAll(require('fs')),
    extend = require('gextend');

var DEFAULTS = {
    dotSize: 20,
    // foregroundColor: 0xFFFFFF,
    // backgroundColor: 0x000000
};

module.exports = {
    createQRCode: function(content, filename, options){
        options = extend({}, DEFAULTS, options);

        var img = qr.encodePng(content, options);
        var uri = module.exports.getImagePath(filename);

        //We probably want to save this in S3 and just
        //redirect..
        return fs.writeFileAsync('./assets' + uri, img.data);
    },
    getImagePath: function(filename){
        return '/images/qrs/' + filename + '.png';
    },
    getImageStream: function(filename){
        var stream = null,
            filepath = './assets/images/qrs/' + filename;
        try {
            if(!fs.existsSync(filepath)) return stream;
            stream = fs.createReadStream(filepath);
        } catch (e) {}
        return stream;
    }
};
