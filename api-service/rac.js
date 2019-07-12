const fs = require('fs');
const supertest = require('supertest');

const service = function (oAuthToken) {
    const envNamePrefix = process.env.ENV;
    const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
    config.authKey = process.env[`${envNamePrefix}_CT_RAC_AUTH_KEY`];
    const apiKey = process.env[`${envNamePrefix}_API_KEY`];

    var headers = {
        'Content-Type': 'application/json',
        'x-channel': 'TC_AGENT',
        'x-correlationid': '98a82114-d859-8ffe-4f51-ffe284ab3c1f',
        'x-brand': 'T'
    };
    return {
        createRAC: (data, done) => {
            let apiBaseUrl = config.racUrl;
            headers.Authorization = config.authKey;
            
            if(oAuthToken){
                headers.Authorization = `Bearer ${oAuthToken}`;
                headers['x-api-key'] = apiKey;
                apiBaseUrl = config.ctApiGateway;
            }
            const api = supertest(apiBaseUrl);
            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            // //console.log(data);
            // //console.log(headers);
            // //console.log(apiBaseUrl + config.racEndPoint);
            api.post(config.racEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        },
        overrideRAC: (data, done) => {
            let apiBaseUrl = config.racUrl;
            headers.Authorization = process.env[`${envNamePrefix}_CT_OVERRIDE_RAC_AUTH_KEY`];
            
            if(oAuthToken){
                headers.Authorization = `Bearer ${oAuthToken}`;
                headers['x-api-key'] = apiKey;
                apiBaseUrl = config.ctApiGateway;
            }
            const api = supertest(apiBaseUrl);
            ////console.log(apiBaseUrl + config.racEndPoint);
            ////console.log(headers);

            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            api.post(config.racEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        }
    }
}

module.exports = service;