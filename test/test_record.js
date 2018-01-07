'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const cealloga = require('../src/cealloga');
const CeallogFunction = require('../src/models/CeallogFunction');
const localhost = cealloga.localhost;
const settings = require('../src/settings');

chai.use(chaiHttp);

let idUnpublished;
let idPublished;

describe('/code/:id', () => {
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
		let emptyArray = {
			name: 'empty_array',
			label: 'Empty Array',
			body: '(cealloga) => { return []; }'
		};

		// Create unpublished record expected to access by id
		chai
			.request(localhost)
			.post('/code/validate')
			.send(emptyArray)
			.end((err, res, _) => {
				if (err) throw err;

				idUnpublished = res.body.id;

				done();
			});
	});

	before(done => {
		let published = {
			name: 'published',
			label: 'Published',
			body: '(cealloga) => { return []; }'
		};

		// Create published record expected to access by id
		chai
			.request(localhost)
			.post('/code/validate')
			.send(published)
			.end((err, res, _) => {
				if (err) throw err;

				idPublished = res.body.id;

				done();
			});
	});

	before(done => {
		// Publish record expected to access by id
		chai
			.request(localhost)
			.get(`/code/publish/${idPublished}`)
			.end((err, res, _) => {
				if (err) throw err;

				done();
			});
	});

	describe('GET', () => {
		it('should succeed getting existing unpublished code record', done => {
			chai
				.request(localhost)
				.get(`/code/${idUnpublished}`)
				.end((err, res, _) => {
					if (err) throw err;

					let data = res.body;
					let service = `/${settings.cealloga.api_path}/${
						settings.cealloga.test_path
					}/${idUnpublished}`;

					assert(res.status == 200, 'Status is not 200');
					assert(data.id == idUnpublished, 'Wrong id');
					assert(data.compiled, 'Not compiled');
					assert(data.label == 'Empty Array', 'Wrong label');
					assert(data.name == 'empty_array', 'Wrong name');
					assert(!data.published, 'Published, should not be');
					assert(data.service == service, `Not ${service}`);
					done();
				});
		});

		it('should succeed getting existing published code record', done => {
			chai
				.request(localhost)
				.get(`/code/${idPublished}`)
				.end((err, res, _) => {
					if (err) throw err;

					let data = res.body;
					let service = `/${settings.cealloga.api_path}/${data.name}`;

					assert(res.status == 200, 'Status is not 200');
					assert(data.id == idPublished, 'Wrong id');
					assert(data.compiled, 'Not compiled');
					assert(data.label == 'Published', 'Wrong label');
					assert(data.name == 'published', 'Wrong name');
					assert(data.published, 'Not published');
					assert(data.service == service, `Not ${service}`);
					done();
				});
		});

		it('should fail to get non-existing record', done => {
			chai
				.request(localhost)
				.get(`/code/123456789`)
				.end((err, res, _) => {
					let data = res.body;

					assert(err.status == 404, 'Status is not 404');
					assert(
						data.error_type == 'NON_EXISTING_RESOURCE',
						'Wrong error type'
					);
					assert(data.message == 'Resource does not exist.', 'Wrong message');
					done();
				});
		});
	});
});
