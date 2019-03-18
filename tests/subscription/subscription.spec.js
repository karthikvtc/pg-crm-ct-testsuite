require('dotenv').config();
const expect = require('chai').expect;
const mocha = require('mocha')
const tv4 = require('tv4');
const fs = require('fs');
const envNamePrefix = process.env.ENV;
const vinService = require(__dirname + '/../../vin-service')(envNamePrefix);
const subPreviewService = require('../../api-service/sub-preview');
const subscriptionService = require('../../api-service/subscription');
const accountService = require('../../api-service/account');
const test_data = JSON.parse(fs.readFileSync(__dirname + '/subscription.data', 'utf8'));
const utils = require('../../utils');
const schema = fs.readFileSync(__dirname + '/subscription.schema');


var response;
var vin;
var subscriptions = [];
var subscriberGuid, remoteUserGuid;
var data = test_data;
var subResponse = null;
var subItemResponse = null;

describe(`Create Subscription`, () => {
    before((done) => {
        vinService.createVin().then((res) => {
            vin = res;
            done();
        });
    });
    before((done) => {
        var account = {};
        account.firstName = utils.randomStr(5);
        account.lastName = utils.randomStr(5);
        account.email = `${account.lastName}@test.com`;
        account.phoneNumber = utils.randomPhoneNumber();
        accountService.createAccount(account, (err,res) => {
            if (res.body.payload) {
                subscriberGuid = res.body.payload.customer.guid;
                remoteUserGuid = subscriberGuid;
            }
            done();
        });
    });
    before((done) => {
        subPreviewService.getAvailableSubscriptions(vin, (err,res) => {
            response = res;
            if (res.body.payload) {
              subscriptions = res.body.payload.subscriptions;
            }
            done();
        });
    });
    before((done) => {
        data.vin = vin;
        data.subscriberGuid = subscriberGuid;
        data.remoteUserGuid = remoteUserGuid;
        data.subscriptions = subscriptions;
        subscriptionService.createSubscription(data, (err, res) => {
            if(err || res.statusCode != 200){
                console.log('-------------- REQUEST --------------');
                console.log(data);
                console.log('-------------- RESPONSE --------------');
                console.log(JSON.stringify(res.body));
            }
            response = res;
            if(res.body) {
                subResponse = res.body.payload;
                if(res.body.payload && res.body.payload.subscriptions){
                    subItemResponse = res.body.payload.subscriptions[0];
                }
            }
            
            done();
        });
    });

    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });

    it('should return a valid payload', () => {
        expect(subResponse).to.not.be.null;
    });

    it('should return contractID in the response', () => {
        expect(subResponse.contractID).to.exist;
    });
    it('should return more than one subscription items', () => {
        expect(subItemResponse).to.not.be.null;
    });
    it('should return packageID in the response', () => {
        expect(subItemResponse.packageID).to.exist;
    });
    it('should return productCode in the response', () => {
        expect(subItemResponse.productCode).to.exist;
    });
    it('should return ratePlanID in the response', () => {
        expect(subItemResponse.ratePlanID).to.exist;
    });
    it('should return productID in the response', () => {
        expect(subItemResponse.productID).to.exist;
    });
    it('should return term in the response', () => {
        expect(subItemResponse.term).to.exist;
    });
    it('should return termUnit in the response', () => {
        expect(subItemResponse.termUnit).to.exist;
    });
    it('should return type in the response', () => {
        expect(subItemResponse.type).to.exist;
    });
    it('should return subscriptionEndDate in the response', () => {
        expect(subItemResponse.subscriptionEndDate).to.exist;
    });
    it('should return subscriptionID in the response', () => {
        expect(subItemResponse.subscriptionID).to.exist;
    });
});


describe(`Cancel Subscription`, () => {
    before((done) => {
        data = {};
        data.vin = vin;
        data.subscriberGuid = subscriberGuid;
        data.vehicleStatus = "SOLD";
        subscriptionService.cancelSubscription(data, (err, res) => {
            if(err || res.statusCode != 200){
                console.log(err);
                console.log(data);
                console.log(JSON.stringify(res.body));
            }
            response = res;
            done();
        });
    });
 
    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });

    it('should match the schema', async () => {
        expect(await tv4.validate(subscriptions, schema)).to.be.true;
    });
});