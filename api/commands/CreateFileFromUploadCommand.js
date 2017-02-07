'use strict';
//TODO: this should be an external job :)
var path = require('path');
var sharp = require('sharp');
//  f = { files:
// [ { fd: '.../.tmp/uploads/70641673-e0ba-464f-99a5-cb471a97b6c0.PNG',
//     size: 746093,
//     type: 'image/png',
//     filename: 'IMG_6062.PNG',
//     status: 'bufferingOrWriting',
//     field: 'uploaded-file',
//     extra: undefined } ] }

function handleFileUploaded(f){
    console.log('- handleFileUploaded: creating %s models', f.files.length);

    //We are only going to support one file for now :)
    if(f.files.length > 1) {
        sails.log.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        sails.log.warn('CreateFileFromUploadCommand only supports one file at a time');
        sails.log.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    }

    var files = [];
    var file = f.files[0];
    var record = {};

    if(!file.type.indexOf('image')){
        sails.log.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        sails.log.warn('CreateFileFromUploadCommand only supports files of mime type image/*');
        sails.log.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    }

    //Lets start processing:
    var image = sharp(file.fd);

    function getThumbnailName(file){
        var ext = path.extname(file);
        var filename = path.basename(file);
        filename = filename.replace(ext, '_thumb' + ext);
        var target = path.join(path.dirname(file), filename);
        return {filename: filename, target: target};
    }

    image.metadata()
        .then(function(metadata){
            sails.log.info('- creating file %s', file);
            var filename = path.basename(file.fd);
            var thumbnail = getThumbnailName(file.fd);


            record = {
                fd: file.fd,
                size: file.size,
                type: file.type,
                filename: file.filename,
                width: metadata.width,
                height: metadata.height,
                uri: '/uploads/' + filename,
                thumb: '/uploads/' + thumbnail.filename,
            };

            return image
                .resize(300)
                .toFile(thumbnail.target);

        }).then(function(){
            sails.log.info('-image record: ', record);

            return sails.models.files.create([record]).then(function(res){
                sails.log.info('CreateFileFromUploadCommand success...');
                sails.log.info(res);
            }).catch(function(err){
                sails.log.error('CreateFileFromUploadCommand error!');
                sails.log.error(err);
            });
        });
}

module.exports =  {
    eventType: 'file:upload',
    handler: handleFileUploaded
};
