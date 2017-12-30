'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const cealloga = require('../src/cealloga');
const CeallogFunction = require('../src/models/CeallogFunction');
const localhost = cealloga.localhost;
const settings = require('../src/settings');

let idSuccess;
let idMITM;

chai.use(chaiHttp);

describe('/code/publish', () => {
    before((done) => {
        cealloga.onListen(() => {
           done(); 
        });
    });
    
    before((done) => {
        CeallogFunction.remove({}, () => {
            let emptyArray = {
                name: 'empty_array',
                label: 'Empty Array',
                body: '(cealloga) => { return []; }'
            };
            
            // Create record expected to validate successfully
            chai.request(localhost)
                .post('/code/validate')
                .send(emptyArray)
                .end((err, res, _) => {
                    if(err) throw err;
                    
                    idSuccess = res.body.id;
                    
                    done();
                });
            
        }).exec();
    });
    
    before((done) => {
        let mitm = {
            name: 'mitm',
            label: 'MITM',
            body: '(cealloga) => { return []; }'
        };

        // Create record expected to fail due to MITM invalidating the code
        chai.request(localhost)
            .post('/code/validate')
            .send(mitm)
            .end((err, res, _) => {
                if(err) throw err;
                
                idMITM = res.body.id;
                
                done();
            });
    });
    
    describe('POST', () => {
        it('should succeed publishing valid code record', (done) => {
            chai.request(localhost)
                .get(`/code/publish/${idSuccess}`)
                .end((err, res, _) => {
                    if(err) throw err;
                    
                    let data = res.body;
                    
                    assert(res.status == 200, 'Not a 200 response');
                    assert(data.id != null, 'No `id`');
                    assert(data.compiled == true, '`compiled` not `true`');
                    assert(data.published == true, '`published` not `true`');
                    assert(data.service == `/${settings.cealloga.api_path}/${data.name}`, 'Wrong `service`');
                    done(); 
                });
        });
        
        it('should fail to compile and publish code that\'s been MITM\'d in MongoDB.', (done) => {
            let mitmCode = '(ceallog) => { const spawn = require("child_process"); child_process.exec("echo All your base are belong to us > /mitm.txt");}';
            CeallogFunction.update({_id: idMITM}, {body: mitmCode}, (err, _) => {
                if(err) throw err;
                
                chai.request(localhost)
                    .get(`/code/publish/${idMITM}`)
                    .end((err, res, _) => {
                        assert(err);
                        
                        let data = res.body;

                        assert(res.status == 400, 'Not a 400 response');
                        assert(data.error_type == 'COMPILATION_ERROR', 'Not a compilation error');
                        assert(data.message == 'Use of `require()` is illegal.', 'Wrong message');
                        assert(data.location.start.column == 29, 'Wrong start column');
                        assert(data.location.end.column == 36, 'Wrong end column');
                        done(); 
                    });
            });
        });
    });
});
