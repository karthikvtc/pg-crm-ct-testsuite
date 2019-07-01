require('dotenv').config();
const expect = require('chai').expect;
const mocha = require('mocha')
const tv4 = require('tv4');
const fs = require('fs');
const envNamePrefix = process.env.ENV;
const OAuthService = require('../../api-service/oauth');

describe(`Get OAuth Token`, () => {
    before((done) => {
        const oauthService = new OAuthService();
        oauthService.getAuthToken((err, res) => {
            response = res;
            //////console.log(res.body);
            done();
        });
    });

    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });

    it("should have access_token", () => {
        expect(response.body.access_token).is.exist;
    });
});