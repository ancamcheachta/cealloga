/**
 * @desc Cealloga rest API client for the browser.
 * @since 0.3.0
 */

(function(c) {
    const endpoints = {
        ceallogaDev: '/cealloga/_test',
        ceallogaProd: '/cealloga',
        codeList: '/code',
        codePublish: '/code/publish',
        codeRecord: '/code',
        codeUnpublish: '/code/unpublish',
        codeValidate: '/code/validate'
    };
    
    const get = () => {
        return {
            method: 'GET',
            mode: 'same-origin',
            headers: new Headers({'Content-Type': 'application/json'})
        }
    };
    
    const post = body => {
        return {
            method: 'POST', 
            mode: 'same-origin', 
            body: JSON.stringify(body),
            headers: new Headers({'Content-Type': 'application/json'})
        };
    };
    
    const queryString = query => {
        let qs = '';
        
        Object.keys(query).forEach(param => {
            let value = encodeURIComponent(param);
            
            qs += `${param}=${value}&`;
        });
        
        return qs;
    };
    
    const request = (uri, method, body, callback) => {
        let fetchHandler, res;
        
        switch (method) {
            case 'GET':
                fetchHandler = get();
                break;
            case 'POST':
                fetchHandler = post(body);
                break;
        }
        
        return fetch(uri, fetchHandler)
            .then(response => {
                res = response;
                response.json()
                    .then(json => responseJsonThen(res, callback)(json))
                    .catch(err => callback(err, null, res));
            }).catch(err => callback(err, null, null));
    };
    
    const responseJsonThen = (response, callback) => {
        return result => {
            return callback(null, result, response);
        };
    };
    
    class ApiClient {
        constructor(options) {
            options = options || {};
            
            this.cealloga = new Cealloga(this);
            this.code = new Code(this);
            this.host = 
                options.host || /^((?:http:|https:)\/\/[\w\d\.\-:]*)\/?/g
                    .exec(window.location.href)[1];
        }
    }
    
    class Cealloga {
        constructor(_client) {
            this._client = _client;
        }
        
        exec(name, body, callback) {
            let endpoint, host = this._client.host;
            
            if (typeof arguments[0] == 'object') {
                endpoint = arguments[0].endpoint;
            } else {
                endpoint = `${endpoints.ceallogaProd}/${name}`;
            }
            
            request(`${host}${endpoint}`, 'POST', body, callback);
        }
        
        _test(id, body, callback) {
            let endpoint, host = this._client.host;
            
            if (typeof arguments[0] == 'object') {
                endpoint = arguments[0].endpoint;
            } else {
                endpoint = `${endpoints.ceallogaDev}/${id}`;
            }
            
            request(`${host}${endpoint}`, 'POST', body, callback);
        }
    }
    
    class Code {
        constructor(_client) {
            this._client = _client;
        }
        
        list(query, callback) {
            let params = queryString(query),
                endpoint = `${endpoints.codeList}?${params}`,
                host = this._client.host;
                
            request(`${host}${endpoint}`, 'GET', null, callback);
        }
        
        publish(id, callback) {
            let endpoint = `${endpoints.codePublish}/${id}`,
                host = this._client.host;
                
            request(`${host}${endpoint}`, 'GET', null, callback);
        }
        
        record(id, callback) {
            let endpoint = `${endpoints.codeRecord}/${id}`,
                host = this._client.host;
                
            request(`${host}${endpoint}`, 'GET', null, callback);
        }
        
        unpublish(name, callback) {
            let endpoint = `${endpoints.codeUnpublish}/${name}`,
                host = this._client.host;
                
            request(`${host}${endpoint}`, 'GET', null, callback);
        }
        
        validate(body, callback) {
            let endpoint = `${endpoints.codeValidate}`,
                host = this._client.host;
            
            request(`${host}${endpoint}`, 'POST', body, callback);
        }
    }
    
    this.cealloga = this.cealloga || c;
    this.cealloga.api = new ApiClient();
})(window.cealloga || {});
