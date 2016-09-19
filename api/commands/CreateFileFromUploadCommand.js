'use strict';

function handleFileUploaded(f){
    console.log('- handleFileUploaded: creating %s models', f.files.length);

   //  f = { files:
   // [ { fd: '.../.tmp/uploads/70641673-e0ba-464f-99a5-cb471a97b6c0.PNG',
   //     size: 746093,
   //     type: 'image/png',
   //     filename: 'IMG_6062.PNG',
   //     status: 'bufferingOrWriting',
   //     field: 'uploaded-file',
   //     extra: undefined } ] }
    var files = [];
    f.files.map(function(file){
        sails.log.info('- creating file %s', file);
        var filename = require('path').basename(file.fd);

        files.push({
            fd: file.fd,
            size: file.size,
            type: file.type,
            filename: file.filename,
            uri: '/uploads/' + filename
        });
    });

    sails.models.files.create(files).then(function(res){
        sails.log.info('CreateFileFromUploadCommand success...');
        sails.log.info(res);
    }).catch(function(err){
        sails.log.error('CreateFileFromUploadCommand error!');
        sails.log.error(err);
    });
}

module.exports =  {
    eventType: 'file:upload',
    handler: handleFileUploaded
};
