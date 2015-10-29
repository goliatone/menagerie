// 'use strict';

require('sails-test-helper');

describe(TEST_NAME, function(){
   describe('GET index', function(){
	it('should be successful', function(done){
	    request.get('/dashboard')
		.expect(302)
		.end(done);
	});
   });
});
