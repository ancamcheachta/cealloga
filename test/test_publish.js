'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const cealloga = require('../src/cealloga');
const CeallogFunction = require('../src/models/CeallogFunction');
const localhost = cealloga.localhost;
const settings = require('../src/settings');

let id;

chai.use(chaiHttp);

describe('/code/publish', () => {
    before((done) => {
        cealloga.onListen(() => {
           done(); 
        });
    });
    
    before((done) => {
        CeallogFunction.remove({}, () => {
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
                    
                    id = data.id;
                    
                    done();
                });
        }).exec();
    });
    
    describe('POST', () => {
        it('should succeed publishing valid code record', (done) => {
            chai.request(localhost)
                .get(`/code/publish/${id}`)
                .end((err, res, _) => {
                    if(err) throw err;
                    
                    let data = res.body;
                    // console.log(data);
                    assert(res.status == 200, 'Not a 200 response');
                    assert(data.id != null, 'No `id`');
                    assert(data.compiled == true, '`compiled` not `true`');
                    assert(data.published == true, '`published` not `true`');
                    assert(data.service == `/${settings.cealloga.api_path}/${data.name}`, 'Wrong `service`');
                    done(); 
                });
        });
    });
});
