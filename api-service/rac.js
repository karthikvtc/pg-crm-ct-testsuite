const fs = require('fs');
const supertest = require('supertest');

const service = function () {
    const envNamePrefix = process.env.ENV;
    const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
    config.authKey = process.env[`${envNamePrefix}_CT_RAC_AUTH_KEY`];
    var headers = {
        'Content-Type': 'application/json',
        'X-CHANNEL': 'TC_AGENT',
        'X-CORRELATIONID': '98a82114-d859-8ffe-4f51-ffe284ab3c1f',
        'X-BRAND': 'L',
        'Authorization': config.authKey,
        'DATETIME': 1540232258482
    };
    return {
        createRAC: (data, done) => {
            const api = supertest(config.racUrl);
            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            api.post(config.racEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        },
        overrideRAC: (data, done) => {
            const api = supertest(config.overrideRACUrl);
            headers.Authorization =process.env[`${envNamePrefix}_CT_OVERRIDE_RAC_AUTH_KEY`];
            console.log(headers);
            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            api.post(config.overrideRACEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        }
    }
}

module.exports = service;