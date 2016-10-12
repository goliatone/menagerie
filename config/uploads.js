'use strict';

module.exports.uploads = {
    csv: {
        device: {
            transformation: function deviceTx(data){return data;}
        },
        location: {
            transformation: function locationTx(data){return data;}
        }
    }
};
