'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const cealloga = require('../src/cealloga');
const CeallogFunction = require('../src/models/CeallogFunction');
const localhost = cealloga.localhost;
const settings = require('../src/settings');

chai.use(chaiHttp);

const uri = `/${settings.cealloga.api_path}/${settings.cealloga.test_path}`;
let id;
let oldid;

describe('/cealloga/_test/:id', () => {
	before(done => {
	    let old = {
	        name: 'skylark',
	        label: 'Skylark',
	        body: '(ceallog) => { return ["f","m","t","t","a","l"]; }',
	        created_date: new Date(1981, 4, 5)
	    };
	    
	    let ceallogFunction = new CeallogFunction(old);
	    
	    ceallogFunction.save(old, (err, result) => {
	        if (err) throw err;
	        
	        oldid = result._id;
	        done();
	    });
	});
    
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
		let splitString = {
			name: 'split_string',
			label: 'Split string into array',
			body: '(ceallog) => { return ceallog.vars.val.split(" "); }'
		};

        // Create unpublished ceallog function to be used later
		chai
			.request(localhost)
			.post('/code/validate')
			.send(splitString)
			.end((err, res, _) => {
				if (err) throw err;

				id = res.body.id;

				done();
			});
	});
	
	describe('POST', () => {
		it('should successfully execute unpublished `split_string()` function', done => {
			let body = {
				val: 'Dia dhuit, a dhomhain!'
			};

			chai
				.request(localhost)
				.post(`${uri}/${id}`)
				.send(body)
				.end((err, res, _) => {
					if(err) throw err;

					let data = res.body;

                    assert(
                        data.join(' ') == 'Dia dhuit, a dhomhain!',
                        'Wrong return value'
                    );
				    assert(res.status == '200', 'Wrong status code');
					done();
				});
		});
		
		it('failed execution of `split_string()` function if body is empty', done => {
			let body = {};

			chai
				.request(localhost)
				.post(`${uri}/${id}`)
				.send(body)
				.end((err, res, _) => {
					let data = res.body;

                    assert(
                        data.message == "Cannot read property 'split' of undefined",
                        'Wrong error message'
                    );
				    assert(err.status == '500', 'Wrong status code');
					done();
				});
		});
		
		it('successful execution of `skylark()` function after server start-up', done => {
			let body = {};
            
			chai
				.request(localhost)
				.post(`${uri}/${oldid}`)
				.send(body)
				.end((err, res, _) => {
				    if (err) throw err;
				    
					let data = res.body;
					
                    assert(data.join('') == 'fmttal', 'Wrong return value');
				    assert(res.status == '200', 'Wrong status code');
					done();
				});
		});
	});
});