const fs = require('fs');
const supertest = require('supertest');

const service = function (oAuthToken) {
    const envNamePrefix = process.env.ENV;
    const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
    config.authKey = process.env[`${envNamePrefix}_CT_SUBSCRIPTION_AUTH_KEY`];
    const apiKey = process.env[`${envNamePrefix}_API_KEY`];

    var headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'deflate',
        'x-channel': 'TC_AGENT',
        'x-correlationid': '98a82114-d859-8ffe-4f51-ffe284ab3c1f',
        'x-brand': 'T',
        'Authorization': config.authKey,
        'datetime': 1540232258482
    };

    return {
        createSubscription: (data, done) => {
            let apiBaseUrl = config.orchestrationApiBaseUrl;
            headers.Authorization = config.authKey;
            
            if(oAuthToken){
                headers.Authorization = `Bearer ${oAuthToken}`;
                headers['x-api-key'] = apiKey;
                apiBaseUrl = config.ctApiGateway;
            }
            const api = supertest(apiBaseUrl);
           // //console.log(apiBaseUrl + config.subscriptionEndPoint);
           // //console.log(headers);

            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            //////console.log(JSON.stringify(data));
            api.post(config.subscriptionEndPoint)
                .set(headers)
                .send(JSON.stringify(data))
                .end(done);
        },
        cancelSubscription: (data, done) => {
            let apiBaseUrl = config.orchestrationApiBaseUrl;
            headers.Authorization = config.authKey;
            
            if(oAuthToken){
                headers.Authorization = `Bearer ${oAuthToken}`;
                headers['x-api-key'] = apiKey;
                apiBaseUrl = config.ctApiGateway;
            }
            const api = supertest(apiBaseUrl);

            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            const cancelSubEndPoint = "/subscription/v1/cancel";
            //////console.log(apiBaseUrl + cancelSubEndPoint);

            api.put(cancelSubEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        },
        createEC: (data, done) => {
            let apiBaseUrl = config.orchestrationApiBaseUrl;
            headers.Authorization = config.authKey;
            
            if(oAuthToken){
                headers.Authorization = `Bearer ${oAuthToken}`;
                headers['x-api-key'] = apiKey;
                apiBaseUrl = config.ctApiGateway;
            }
            const api = supertest(apiBaseUrl);

            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            const ecEndPoint = "/subscription/v1/emergencycontact";
            //console.log(data);
            api.put(ecEndPoint)
                .set(headers)
                .send(data)
                .end(done);
        },
        replaceRemoteUser: (data, done) => {
            let apiBaseUrl = config.orchestrationApiBaseUrl;
            headers.Authorization = config.authKey;
            
            if(oAuthToken){
                headers.Authorization = `Bearer ${oAuthToken}`;
                headers['x-api-key'] = apiKey;
                apiBaseUrl = config.ctApiGateway;
            }
            const api = supertest(apiBaseUrl);

            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            const endpoint = "/subscription/v1/remoteguid";
            //console.log(data);
            api.put(endpoint)
                .set(headers)
                .send(data)
                .end(done);
        },
        updateDataConsent: (data, done) => {
            let apiBaseUrl = config.orchestrationApiBaseUrl;
            headers.Authorization = config.authKey;
            
            if(oAuthToken){
                headers.Authorization = `Bearer ${oAuthToken}`;
                headers['x-api-key'] = apiKey;
                apiBaseUrl = config.ctApiGateway;
            }
            const api = supertest(apiBaseUrl);

            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            const endpoint = "/subscription/v1/dataconsent";
            //console.log(data);
            api.put(endpoint)
                .set(headers)
                .send(data)
                .end(done);
        },
        createWifiTrial: (data, done) => {
            let apiBaseUrl = config.wifiUrl;
            headers.Authorization = config.authKey;
            
            if(oAuthToken){
                headers.Authorization = `Bearer ${oAuthToken}`;
                headers['x-api-key'] = apiKey;
                apiBaseUrl = config.ctApiGateway;
            }
            const api = supertest(apiBaseUrl);
            const endpoint = "/v1/wifitrial";
            ////console.log(headers);
            process.env.REQUEST_HEADERS = JSON.stringify(headers);
            api.post(endpoint)
                .set(headers)
                .send(JSON.stringify(data))
                .end(done);
        },
    }
}

module.exports = service;