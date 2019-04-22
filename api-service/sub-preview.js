const fs = require('fs');
const supertest = require('supertest');

const service = function () {
    const envNamePrefix = process.env.ENV;
    const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
    config.authKey = process.env[`${envNamePrefix}_CT_SUB_PREVIEW_AUTH_KEY`];

    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CHANNEL': 'TC_AGENT',
        'X-CORRELATIONID': '123e4567-e89b-12d3-a456-abhishek0002',
        'X-BRAND': 'L',
        'asi-code': 'AS',
        'hw-type': '010',
        'generation': '17CYPLUS',
        'region': 'US',
        'Authorization': config.authKey,
        'DATETIME': 1511796583386
    };

    return {
        getAvailableSubscriptions: (vin, done) => {
            const subPreviewEndPoint = `${config.subPreviewEndPoint}/${vin}`;
            const api = supertest(config.subscriptionPreviewUrl);
            headers.vin = vin;
            process.env.REQUEST_HEADERS = JSON.stringify(headers);

            api.get(subPreviewEndPoint)
                .set(headers)
                .end(done)
        }
    }
}

module.exports = service;