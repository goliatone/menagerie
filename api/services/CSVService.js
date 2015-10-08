var Converter = require('csvtojson').Converter;
var converter = new Converter({});

module.exports = {

    toJSON: function(filepath){

        converter.on('end_parsed', function(json){
            console.log('CSV', json);
        });

        //handle errors here
        require('fs').createReadStream(filepath).pipe(converter);
    }
};
