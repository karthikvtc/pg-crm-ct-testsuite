const fs = require('fs');
const supertest = require('supertest');

const envNamePrefix = process.env.ENV;
const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
config.authKey = process.env[`${envNamePrefix}_CT_SUBSCRIPTION_AUTH_KEY`];

var headers = {
    'Content-Type': 'application/json',
    'X-CHANNEL': 'TC_AGENT',
    'X-CORRELATIONID': '98a82114-d859-8ffe-4f51-ffe284ab3c1f',
    'X-BRAND': 'L',
    'Authorization': '8923gf7126h44b14d3df08dd9f87a',
    'DATETIME': 1540232258482
};

const service = function () {
    return {
        createSubscription: (data, done) => {
            const api = supertest(config.orchestrationApiBaseUrl);
            api.post(config.subscriptionEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        },
        cancelSubscription: (data, done) => {
            const api = supertest(config.orchestrationApiBaseUrl);
            const cancelSubEndPoint = "/subscription/v1/cancel";
            api.put(cancelSubEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        },
    }
}

module.exports = service();