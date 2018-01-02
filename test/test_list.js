'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const cealloga = require('../src/cealloga');
const CeallogFunction = require('../src/models/CeallogFunction');
const localhost = cealloga.localhost;
const settings = require('../src/settings');

chai.use(chaiHttp);

let idPublished;

describe('/code/', () => {
	before(done => {
		cealloga.onListen(() => {
			done();
		});
	});

	before(done => {
		CeallogFunction.remove({}, () => {
			done();
		});
	});
	
	before(done => {
		let oldPublished = {
			name: 'work_in_progress',
			label: 'Work In Progress',
			body: '(cealloga) => { return ["Hello"]; }'
		};

		chai
			.request(localhost)
			.post('/code/validate')
			.send(oldPublished)
			.end((err, res, _) => {
				if (err) throw err;

				done();
			});
	});
	
	before(done => {
		let newPublished = {
			name: 'work_in_progress',
			label: 'Work In Progress',
			body: '(cealloga) => { return ["Hello", "world"]; }'
		};

		chai
			.request(localhost)
			.post('/code/validate')
			.send(newPublished)
			.end((err, res, _) => {
				if (err) throw err;

				idPublished = res.body.id;

				done();
			});
	});
	
	before(done => {
		chai
			.request(localhost)
			.get(`/code/publish/${idPublished}`)
			.end((err, res, _) => {
				if (err) throw err;

				done();
			});
	});

	describe('GET', () => {
		it('should fail to query unpublished code without specifying name', done => {
			chai
				.request(localhost)
				.get(`/code/`)
				.query({published: 0})
				.end((err, res, _) => {
					assert(err.status == 400, 'Status is not 400');
					assert(
						res.body.error_type == 'MISSING_NAME_PARAMETER',
						'Wrong `error_type`'
					);
					assert(
						res.body.message == '`name` parameter must be included when querying unpublished resources.',
						'Wrong `message`'
					);
					done();
				});
		});
		
		it('should succeed querying code by name only', done => {
			chai
				.request(localhost)
				.get(`/code/`)
				.query({name: 'work_in_progress'})
				.end((err, res, _) => {
					if(err) throw err;

					assert(res.statusCode == 200, 'Not a 200 response');
					assert(res.body.length == 2, 'Wrong response body length');
					
					done();
				});
		});
		
		it('should succeed querying unpublished code by name', done => {
			chai
				.request(localhost)
				.get(`/code/`)
				.query({name: 'work_in_progress', published: '0'})
				.end((err, res, _) => {
					if(err) throw err;

					assert(res.statusCode == 200, 'Not a 200 response');
					assert(res.body.length == 1, 'Wrong response body length');
					
					done();
				});
		});
		
		it('should succeed querying published code', done => {
			chai
				.request(localhost)
				.get(`/code/`)
				.query({published: '1'})
				.end((err, res, _) => {
					if(err) throw err;

					assert(res.statusCode == 200, 'Not a 200 response');
					assert(res.body.length == 1, 'Wrong response body length');
					
					done();
				});
		});
	});
});
