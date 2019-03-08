require('dotenv').config();
const supertest = require('supertest');
const expect = require('chai').expect;
const mocha = require('mocha')
const tv4 = require('tv4');
const fs = require('fs');
const envNamePrefix = process.env.ENV;
const vinService = require(__dirname + '/../../vin-service')(envNamePrefix);
const config = JSON.parse(fs.readFileSync(__dirname + '/subscription.config'))[envNamePrefix];
const sub_preview_schema = fs.readFileSync(__dirname + '/subscriptions-preview.schema');

config.authKey = process.env[`${envNamePrefix}_CT_SUB_PREVIEW_AUTH_KEY`];
var response;
var vin;
var subscriptions = {};
var availableSubscription = {};

var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CHANNEL': 'TC_AGENT',
    'X-CORRELATIONID': '123e4567-e89b-12d3-a456-abhishek0002',
    'X-CHANNEL': 'TC_AGENT',
    'X-BRAND': 'L',
    'asi-code': 'AB',
    'hw-type': '010',
    'generation': '17CYPLUS',
    'region': 'US',
    'Authorization': config.authKey,
    'DATETIME': 1511796583386
};
describe(`Get Available Subscriptions`, () => {
    before((done) => {
        vinService.createVin().then((res) => {
            vin = res;
            headers.vin = vin;
            done();
        });
    });
    before((done) => {
        const subPreviewEndPoint = `${config.subPreviewEndPoint}/${vin}`;
        const api = supertest(config.subscriptionPreviewUrl);
        api.get(subPreviewEndPoint)
            .set(headers)
            .end((err, res) => {
                response = res;
                if (res.body.payload) {
                    subscriptions = res.body.payload.subscriptions;
                    availableSubscription = subscriptions[0];
                }
                done();
            })
    });

    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });

    it('should match the schema', async () => {
        expect(await tv4.validate(subscriptions, sub_preview_schema)).to.be.true;
    });

    it("should return list of subscriptions", () => {
        expect(subscriptions).to.be.an('array');
        expect(subscriptions).to.have.lengthOf.above(0);
    });

    it("should have productName", () => {
        expect(availableSubscription.productName).is.exist;
    });

    it("should have productID", () => {
        expect(availableSubscription.productID).is.exist;
    });

    it("should have term", () => {
        expect(availableSubscription.term).is.exist;
    });

    it("should have termUnit", () => {
        expect(availableSubscription.termUnit).is.exist;
    });

    it("should have type", () => {
        expect(availableSubscription.type).is.exist;
    });

    it("should have type should match either Trial or Paid", () => {
        expect(availableSubscription.type).to.be.oneOf(['Trial','Paid']);
    });
    it("should have subscriptionEndDate", () => {
        expect(availableSubscription.subscriptionEndDate).is.exist;
    });
});