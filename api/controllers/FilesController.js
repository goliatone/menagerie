/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index: function (req,res){
		res.writeHead(200, {'content-type': 'text/html'});
    	res.end(
    		'<form action="http://localhost:1337/file/upload" enctype="multipart/form-data" method="post">'+
    		'<input type="text" name="title"><br>'+
    		'<input type="file" name="uploaded-file" multiple="multiple"><br>'+
    		'<input type="submit" value="Upload">'+
    		'</form>'
    	);
  	},
  	upload: function  (req, res) {
    	req.file('uploaded-file').upload(function (err, files) {
      		if (err) return res.serverError(err);
			//Trigger command
			sails.emit('file:upload', {files:files});
			sails.sockets.emit('/file/upload', {progress: 0});
			
			if(req.wantsJSON){
				return res.jsonx({
	        		message: files.length + ' file(s) uploaded successfully!',
	        		files: files
	      		});
			}
			return res.redirect('back');

    	});
  	},
	uploadS3: function (req, res) {
    	req.file('avatar').upload({
      		adapter: require('skipper-s3'),
      		key: 'S3 Key',
      		secret: 'S3 Secret',
      		bucket: 'Bucket Name'
    	}, function (err, filesUploaded) {
      		if (err) return res.negotiate(err);
  			return res.ok({
    			files: filesUploaded,
    			textParams: req.params.all()
  			});
		});
	}
};
