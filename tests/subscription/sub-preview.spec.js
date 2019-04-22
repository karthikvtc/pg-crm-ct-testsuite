require('dotenv').config();
const expect = require('chai').expect;
const mocha = require('mocha')
const tv4 = require('tv4');
const fs = require('fs');
const envNamePrefix = process.env.ENV;
const vinService = require(__dirname + '/../../vin-service')(envNamePrefix);
const sub_preview_schema = fs.readFileSync(__dirname + '/subscriptions-preview.schema');
const SubPreviewService = require('../../api-service/sub-preview');

var response;
var vin;
var subscriptions = {};
var availableSubscription = {};

describe(`Get Available Subscriptions API`, () => {
    before((done) => {
        vinService.createVin(true).then((res) => {
            vin = res;
            done();
        });
    });
    before((done) => {
        const subPreviewService = new SubPreviewService();
        subPreviewService.getAvailableSubscriptions(vin, (err,res)=>{
            if(err || res.statusCode != 200){
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            response = res;
            if (res.body.payload) {
                subscriptions = res.body.payload.subscriptions;
                availableSubscription = subscriptions[0];
            }
            done();
        });
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
        expect(availableSubscription.ratePlanID).to.not.be.empty;
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