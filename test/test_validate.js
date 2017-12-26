'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const cealloga = require('../src/cealloga');
const CeallogFunction = require('../src/models/CeallogFunction');
const localhost = cealloga.localhost;
const settings = require('../src/settings');

chai.use(chaiHttp);

describe('/code/validate', () => {
    before((done) => {
        cealloga.onListen(() => {
           done(); 
        });
    });
    
    before(() => {
        CeallogFunction.remove({}).exec();
    });
    
    describe('POST', () => {
        it('should fail to compile due to invalid code', (done) => {
            let body = {
                name: 'empty_array',
                label: 'Empty Array',
                body: '(cealloga) => { return [; }'
            };
            
            chai.request(localhost)
                .post('/code/validate')
                .send(body)
                .end((err, res, _) => {
                    if(err) throw err;
                    
                    let data = res.body;
                    
                    assert(data['error_type'] == 'COMPILATION_ERROR', 'Wrong `error_type` value');
                    assert(data.compiled == false, 'Wrong `compiled` value');
                    assert(data.location.start.line == 1, 'Wrong start line');
                    assert(data.location.start.column == 24, 'Wrong start column');
                    assert(data.location.end.line == -1, 'Wrong end line');
                    assert(data.location.end.column == -1, 'Wrong end column');
                    done();
                });
        });
        
        it('should succeed to compile and create code function record', (done) => {
            let body = {
                name: 'empty_array',
                label: 'Empty Array',
                body: '(cealloga) => { return []; }'
            };
            
            chai.request(localhost)
                .post('/code/validate')
                .send(body)
                .end((err, res, _) => {
                    if(err) throw err;
                    
                    let data = res.body;
                    
                    assert(res.status == 201, 'Not a 201 response');
                    assert(data.id != null, 'No `id`');
                    assert(data.compiled == true, '`compiled` not `true`');
                    assert(data.published == false, '`published` not `false`');
                    assert(data.service == `/${settings.cealloga.api_path}/${settings.cealloga.test_path}/${data.id}`, 'Wrong `service`');
                    done(); 
                });
        });
    });
    
    after(() => {
        cealloga.stop();
    });
});
