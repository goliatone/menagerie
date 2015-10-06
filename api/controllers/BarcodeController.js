'use strict';
var qr = require('qrcodeine');
var fs = require('fs');


module.exports = {
    index: function(req, res){
        var content = req.param('content'),
            filename = req.param('filename');

        BarcodeService.createQRCode(content, filename).done(function(){
            var uri = BarcodeService.getImagePath(filename);
            res.redirect(uri);
        }).catch(function(err){
            return res.send(err);
        });
    },
    serve: function(req, res){
        var uri = req.params.filename,
            png = BarcodeService.getImageStream(uri);

        if(!png) return res.notFound('404');
        //we should check to see if we actually have the file :/
        var mimeType = 'image/png';
        res.writeHead(200, { 'Content-Type': mimeType });
        png.pipe(res);
    },
    _config:{}
};
