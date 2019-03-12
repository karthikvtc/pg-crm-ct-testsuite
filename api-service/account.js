const fs = require('fs');
const supertest = require('supertest');
const envNamePrefix = process.env.ENV;
const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
const apiEndPoint = config.apiEndPoint;
config.authKey = process.env[`${envNamePrefix}_CT_ACCOUNT_AUTH_KEY`];

var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CHANNEL': 'TC_AGENT',
    'X-CORRELATIONID': '123e4567-e89b-12d3-a456-abhishek0002',
    'Authorization': config.authKey
};

const service = function () {
    return {
        createAccount: (data, done) => {
            const api = supertest(config.createAccountBaseUrl);
            api.post(apiEndPoint)
                .set(headers)
                .send(data)
                .end(done)
        },
        updateAccount: (data, done) => {
            const api = supertest(config.updateAccountBaseUrl);
           
            const payload = {
                customer: data
            }
            api.put(apiEndPoint)
                .set(headers)
                .send(payload)
                .end(done);
        }
    }
}

module.exports = service();