const fs = require('fs');
const supertest = require('supertest');

const service = function () {
    const envNamePrefix = process.env.ENV;
    const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
    const apiEndPoint = config.apiEndPoint;
    config.PostAuthKey = process.env[`${envNamePrefix}_CT_CREATE_ACCOUNT_AUTH_KEY`];
    config.GetAuthKey = process.env[`${envNamePrefix}_CT_SEARCH_ACCOUNT_AUTH_KEY`];
    config.PutAuthKey = process.env[`${envNamePrefix}_CT_UPDATE_ACCOUNT_AUTH_KEY`];

    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CHANNEL': 'TC_AGENT',
        'X-CORRELATIONID': '123e4567-e89b-12d3-a456-abhishek0002',
        'Authorization': ''
    };
    return {
        createAccount: (data, done) => {
            const api = supertest(config.createAccountBaseUrl);
            headers.Authorization = config.PostAuthKey;
            process.env.REQUEST_HEADERS = JSON.stringify(headers);

            api.post(apiEndPoint)
                .set(headers)
                .send(data)
                .end(done)
        },
        updateAccount: (data, done) => {
            const api = supertest(config.updateAccountBaseUrl);
            headers.Authorization = config.PutAuthKey;
            process.env.REQUEST_HEADERS = JSON.stringify(headers);
           
            const payload = {
                customer: data
            }
            api.put(apiEndPoint)
                .set(headers)
                .send(payload)
                .end(done);
        },
        searchAccount: (data, done) => {
            const api = supertest(config.searchAccountBaseUrl);
            headers.Authorization = config.GetAuthKey;
            process.env.REQUEST_HEADERS = JSON.stringify(headers);
           
            if(data.email){
                headers.Email = data.email
            } else if( data.phone){
                headers.Phone = data.phoneNumber
            }
            api.get(apiEndPoint)
                .set(headers)
                .end(done);
        }
    }
}

module.exports = service;