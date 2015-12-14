'use strict';
var Promise = require('bluebird');
var promisePipe = require('promisepipe');

var qr = require('qr-image'),
    extname = require('path').extname,
// var qr = require('qrcodeine'),
    fs = Promise.promisifyAll(require('fs')),
    extend = require('gextend');

var DEFAULTS = {
    type:'png',
    size: 20,
    margin: 4
    // foregroundColor: 0xFFFFFF,
    // backgroundColor: 0x000000
};

module.exports = {
    createQRCode: function(content, filename, options){
        options = extend({}, DEFAULTS, options);

        var uri = module.exports.getImagePath(filename, '.' + options.type);
        var img = qr.imageSync(content, options);

        //We probably want to save this in S3 and just
        //redirect..
        return fs.writeFileAsync('./assets' + uri, img);
    },
    getImagePath: function(filename, ext){
        if(extname(filename)) filename = filename.replace(extname(filename), '');
        return '/images/qrs/' + filename + ext;
    },
    getImageStream: function(filename){
        var stream = null,
            filepath = './assets/images/qrs/' + filename;
        try {
            if(!fs.existsSync(filepath)){
                // return stream;
                module.exports.createQRCode(filename.replace('.png', ''), filename);
            }
            stream = fs.createReadStream(filepath);
        } catch (e) {
            console.log(e.stack);
        }
        return stream;
    }
};
