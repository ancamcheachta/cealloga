'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const cealloga = require('../src/cealloga');
const CeallogFunction = require('../src/models/CeallogFunction');
const localhost = cealloga.localhost;
const settings = require('../src/settings');

chai.use(chaiHttp);

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

	describe('GET', () => {
		it('should succeed querying latest code functions', done => {
			chai
				.request(localhost)
				.get(`/code/`)
				.query({latest: 1})
				.end((err, res, _) => {
					// Assertions here...
					done();
				});
		});
	});
});
