'use strict';
var qr = require('qrcodeine');
var fs = require('fs');


module.exports = {
    index: function(req, res){
        var text = req.param('content'),
            filename = 'qr_' +  Date.now();

        var img = qr.encodePng(text, {
            dotSize:5,
            foregroundColor: 0xFFFFFF,
            backgroundColor: 0x0
        });

        //We probably want to save this in S3 and just
        //redirect...
        var uri = '/images/qrs/' + filename + '.png';

        fs.writeFile('./assets' + uri, img.data, function(err) {
              if(err) return res.send(err);
              res.redirect(uri);
        });
    },
    serve: function(req, res){
        var uri = req.params.filename,
            png = fs.createReadStream('./assets/images/qrs/' + uri);
        //we should check to see if we actually have the file :/
        var mimeType = 'image/png';
        res.writeHead(200, { 'Content-Type': mimeType });
        png.pipe(res);
    },
    _config:{}
};
