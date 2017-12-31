'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const cealloga = require('../src/cealloga');
const CeallogFunction = require('../src/models/CeallogFunction');
const localhost = cealloga.localhost;
const settings = require('../src/settings');

chai.use(chaiHttp);

let id;

describe('/code/unpublish', () => {
    before((done) => {
        cealloga.onListen(() => {
           done(); 
        });
    });
    
    before((done) => {
        CeallogFunction.remove({}, () => {
           done(); 
        });
    });
    
    before((done) => {
        let unpublishTest = {
            name: 'unpublish_test',
            label: 'Unpublish Test',
            body: '(cealloga) => { return []; }'
        };

        // Create record expected to unpublish
        chai.request(localhost)
            .post('/code/validate')
            .send(unpublishTest)
            .end((err, res, _) => {
                if(err) throw err;
                
                id = res.body.id;
                
                done();
            });
    });
    
    before((done) => {
        // Publish record to be unpublished later
        chai.request(localhost)
            .get(`/code/publish/${id}`)
            .end((err, res, _) => {
                if(err) throw err;
                
                done();
            });
    });
    
    describe('GET', () => {
        it('should succeed unpublishing code record', (done) => {
            chai.request(localhost)
                .get(`/code/unpublish/unpublish_test`)
                .end((err, res, _) => {
                    if(err) throw err;
                    
                    let data = res.body;
                    let service = `/${settings.cealloga.api_path}/${settings.cealloga.test_path}/${id}`;
                    
                    assert(res.status == 200, 'Status is not 200');
                    assert(data.id == id, 'Wrong id');
                    assert(data.compiled, 'Not compiled');
                    assert(data.label == 'Unpublish Test', 'Wrong label');
                    assert(data.name == 'unpublish_test', 'Wrong name');
                    assert(!data.published, 'Published, should not be');
                    assert(data.service == service, `Not ${service}`);
                    done();
                });
        });
        
        it('should fail to unpublish non-existing record', (done) => {
            chai.request(localhost)
                .get(`/code/unpublish/asdf`)
                .end((err, res, _) => {
                    let data = res.body;
                    
                    assert(err.status == 404, 'Status is not 404');
                    assert(data.error_type == 'NON_EXISTING_RESOURCE', 'Wrong error type');
                    assert(data.message == 'Resource does not exist.', 'Wrong message');
                    done();
                });
        });
    });
});