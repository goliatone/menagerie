'use strict';
/**
 * FileController
 *
 * check how to thumbnails:
 *     https://github.com/bredikhin/sailsjs-skipper-thumbnail-example
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var BaseController = require('../../lib/BaseController')('Files');
var debug = require('debug')('controller:Device');
var extend = require('gextend');

var Files = {
    index: function (req,res){
        res.writeHead(200, {'content-type': 'text/html'});
        res.end(
            '<h2>Upload File</h2>' +
            '<form action="/files/upload" enctype="multipart/form-data" method="POST">'+
            '<input type="text" name="title"><br>'+
            '<input type="file" name="uploaded-file" multiple="multiple"><br>'+
            '<input type="submit" value="Upload">'+
            '</form>'
        );
    },
    upload: function  (req, res) {

        var options = {
            // dirname: require('path').join(sails.config.paths.tmp, 'public', 'uploads'),
            maxBytes: 5000000, //5MB
            onProgress: function(e){
                sails.io.emit('/files/upload', {progress: e.percent, name: e.name});
            }
        };

        req.file('uploaded-file').upload(options, function (err, files) {
              if (err) return res.serverError(err);
            //Trigger command
            var eventType = getEventType(req);
            console.log('Event Type', eventType);
            sails.emit(eventType, { files: files});

            if(req.wantsJSON){
                return res.jsonx({
                    message: files.length + ' file(s) uploaded successfully!',
                    files: files
                });
            }
            return res.redirect('/' + (req.body.entity || 'files'));
        });
    },
    uploadS3: function (req, res) {
        req.file('uploaded-file').upload({
            adapter: require('skipper-s3'),
            key: process.env.NODE_AWS_ID,
            secret: process.env.NODE_AWS_SECRET,
            bucket: process.env.NODE_AWS_BUCKET
        }, function (err, filesUploaded) {
            if (err) return res.negotiate(err);
            return res.ok({
                files: filesUploaded,
                textParams: req.params.all()
            });
        });
    }
};

module.exports = extend({}, BaseController, Files);

function getEventType(req){
    console.log('getEventType', req.originalUrl);
    return 'file:upload' + (req.body.entity ? (':' + req.body.entity) : '');
}
