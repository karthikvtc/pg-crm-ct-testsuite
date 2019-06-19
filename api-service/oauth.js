const fs = require('fs');
const supertest = require('supertest');

const service = function () {
    const envNamePrefix = process.env.ENV;
    const config = JSON.parse(fs.readFileSync(`${__dirname}/config.${envNamePrefix.toLowerCase()}.json`));
    const authClientId = process.env[`${envNamePrefix}_OAUTH_CLIENT_ID`]; //'6b992ede-4923-4aa8-9106-54dc1290b8b1';//
    const authClientSecret= process.env[`${envNamePrefix}_OAUTH_CLIENT_SECRET`]; //'dDirxxUd~y,D6PI31`}n1Qfk';//
    
    var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    console.log(authClientId);

    var data = {
        'client_id': authClientId,
        'client_secret': authClientSecret,
        'grant_type':'client_credentials',
        'resource':'https://tmnab2cqa.onmicrosoft.com/CTPAPIDev'
    }

    return {
        getAuthToken: (done) => {
            const oAuthEndpoint = config.oAuthApiEndPoint;
           // console.log(config.oAuthApiUrl + oAuthEndpoint);
            const api = supertest(config.oAuthApiUrl);
           // console.log(data);
            api.post(oAuthEndpoint)
                .set(headers)
                .type('form')
                .send(data)
                .end(done)
        }
    }
}

module.exports = service;