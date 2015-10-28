var expect = require('chai').assert;

describe('Device', function(){
    it('should not be empty', function(done){
        Device.find().exec(function(err, devices){
            expect.isNotNull(devices);
            done();
        });
    });
});
