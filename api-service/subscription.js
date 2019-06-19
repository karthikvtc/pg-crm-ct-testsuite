const fs = require('fs');
const supertest = require('supertest');

const service = function (oAuthToken) {
    const envNamePrefix = process.env.ENV;
    const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
    config.authKey = process.env[`${envNamePrefix}_CT_SUBSCRIPTION_AUTH_KEY`];
    const apiKey = process.env[`${envNamePrefix}_API_KEY`];

    var headers = {
        'Content-Type': 'application/json',
        'x-channel': 'TC_AGENT',
        'x-correlationid': '98a82114-d859-8ffe-4f51-ffe284ab3c1f',
        'x-brand': 'L',
        'authorization': config.authKey,
        'datetime': 1540232258482
    };
    if(oAuthToken){
        headers.Authorization = `Bearer ${oAuthToken}`;
        headers['x-api-key'] = apiKey;
    }
    return {
        createSubscription: (data, done) => {
            const api = supertest(config.orchestrationApiBaseUrl);
            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            api.post(config.subscriptionEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        },
        cancelSubscription: (data, done) => {
            const api = supertest(config.orchestrationApiBaseUrl);
            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            const cancelSubEndPoint = "/subscription/v1/cancel";
            api.put(cancelSubEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        },
    }
}

module.exports = service;