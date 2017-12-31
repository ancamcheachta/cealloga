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
                    // TODO: Should not really be 204, no?  See README and refactor.
                    assert(res.status == 204, 'Status is not 204');
                    done();
                });
        });
    });
});