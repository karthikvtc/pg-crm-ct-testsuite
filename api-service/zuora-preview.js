const fs = require('fs');
const supertest = require('supertest');



const service = function () {
    const envNamePrefix = process.env.ENV;
    const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
    config.authKey = process.env[`${envNamePrefix}_CT_ZUORA_PREVIEW_AUTH_KEY`];

    var headers = {
        'Content-Type': 'application/json',
        'X-CHANNEL': 'TC_AGENT',
        'X-CORRELATIONID': '98a82114-d859-8ffe-4f51-ffe284ab3c1f',
        'X-BRAND': 'L',
        'Authorization': config.authKey
    };

    return {
        getPreview: (data, done) => {
            const api = supertest(config.zuoraPreviewUrl);
            api.post(config.zuoraPreviewEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        }
    }
}

module.exports = service;