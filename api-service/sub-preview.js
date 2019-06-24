const fs = require('fs');
const supertest = require('supertest');

const service = function (oAuthToken) {
    const envNamePrefix = process.env.ENV;
    const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
    config.authKey = process.env[`${envNamePrefix}_CT_SUB_PREVIEW_AUTH_KEY`];
    const apiKey = process.env[`${envNamePrefix}_API_KEY`];
    
    var headers = {
        'accept': 'application/json',
        'content-Type': 'application/json',
        'x-channel': 'TC_AGENT',
        'x-correlationid': '123e4567-e89b-12d3-a456-abhishek0002',
        'x-brand': 'T',
        'asi-code': 'AP',
        'hw-type': '010',
        'generation': '17CYPLUS',
        'region': 'US',
        'authorization': config.authKey,
        'datetime': 1511796583386
    };

    return {
        getAvailableSubscriptions: (vin, done) => {
            const subPreviewEndPoint = `${config.subPreviewEndPoint}/${vin}`;
            let apiBaseUrl = config.subscriptionPreviewUrl;
            headers.authorization = config.authKey;
            
            if(oAuthToken){
                headers.authorization = `Bearer ${oAuthToken}`;
                headers['x-api-key'] = apiKey;
                apiBaseUrl = config.ctApiGateway;
            }
            const api = supertest(apiBaseUrl);

            headers.vin = vin;
            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            api.get(subPreviewEndPoint)
                .set(headers)
                .end(done)
        }
    }
}

module.exports = service;