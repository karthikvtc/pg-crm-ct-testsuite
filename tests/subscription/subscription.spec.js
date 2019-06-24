require('dotenv').config();
const expect = require('chai').expect;
const mocha = require('mocha')
const tv4 = require('tv4');
const fs = require('fs');
const moment = require('moment');
const envNamePrefix = process.env.ENV;
const vinService = require(__dirname + '/../../vin-service')(envNamePrefix);
const SubPreviewService = require('../../api-service/sub-preview');
const RacService = require('../../api-service/rac');
const SubscriptionService = require('../../api-service/subscription');
const AccountService = require('../../api-service/account');
const test_data = JSON.parse(fs.readFileSync(__dirname + '/subscription.data', 'utf8'));
const utils = require('../../utils');
const schema = fs.readFileSync(__dirname + '/subscription.schema');
const OAuthService = require('../../api-service/oauth');
var oAuthToken;
var response;
var vin;
var subscriptions = [];
var subscriberGuid, remoteUserGuid;
var data = test_data;
var subResponse = null;
var subItemResponse = null;
var subAPIResponse = null;

describe(`Create Trial Subscription `, () => {
    before((done) => {
        const envNamePrefix = process.env.OAUTH;
        if(process.env.OAUTH == 'true'){
            const oauthService = new OAuthService(oAuthToken);
            oauthService.getAuthToken((err,res) => {
                if(res.body){
                    oAuthToken = res.body.access_token;
                }
                done();
            });
        } else {
            done();
        }
    });
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
        const accountService = new AccountService(oAuthToken);
        accountService.createAccount(account, (err,res) => {
            if (res.body.payload) {
                subscriberGuid = res.body.payload.customer.guid;
                remoteUserGuid = subscriberGuid;
            }
            done();
        });
    });
    before((done) => {
        const subPreviewService = new SubPreviewService(oAuthToken);
        subPreviewService.getAvailableSubscriptions(vin, (err,res) => {
            response = res;
            if (res.body.payload) {
              subscriptions = res.body.payload.subscriptions.map(({type,termUnit,term,subscriptionStartDate,subscriptionEndDate, ratePlanID, productName,productID,productCode, packageID}) => ({type,termUnit,term,subscriptionStartDate,subscriptionEndDate, ratePlanID, productName,productID,productCode, packageID}));
            }
            done();
        });
    });
    before((done) => {
        data.vin = vin;
        data.subscriberGuid = subscriberGuid;
        data.remoteUser = { remoteUserGuid };
        data.paymentMethodId = null;
        data.termsAcceptanceDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSS').toString() + '-0500';
        data.createDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSS').toString() + '-0500';
        data.subscriptions = subscriptions.filter((s)=>{return s.type === 'Trial'});
        const subscriptionService = new SubscriptionService(oAuthToken);
        //console.log(data);
        subscriptionService.createSubscription(data, (err, res1) => {
            if(err || res1.statusCode != 200){
                process.env.API_NAME = 'CREATE SUBSCRIPTION';

                process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res1.body);
            }
            subAPIResponse = res1;
            if(res1.body) {
                subResponse = res1.body.payload;
                if(res1.body.payload && res1.body.payload.subscriptions){
                    subItemResponse = res1.body.payload.subscriptions[0];
                }
            }
            
            done();
        });
    });

    it('should return 200', () => {
        expect(subAPIResponse.status).to.equal(200);
    });

    it('should return more than one subscription items', () => {
        expect(subItemResponse).to.not.be.null;
    });

    it('should return subscriptionID in the response', () => {
        expect(subItemResponse.subscriptionID).to.exist;
        expect(subItemResponse.subscriptionID).to.not.be.empty;
    });

    it('should return contractID in the response', () => {
        expect(subResponse.contractID).to.exist;
        expect(subResponse.contractID).to.not.be.empty;
    });

    it('should return ratePlanID in the response', () => {
        expect(subItemResponse.ratePlanID).to.exist;
        expect(subItemResponse.ratePlanID).to.not.be.empty;
    });
});

describe(`Emergency Contact`, () => {
    before((done) => {
        data = {};
        data.vin = vin;
        data.subscriberGuid = subscriberGuid;
        data.emergencyContact = {
            firstName: 'testfn',
            lastName: 'testln',
            phoneNumber: '2143451234'
        };
        const subscriptionService = new SubscriptionService(oAuthToken);

        subscriptionService.createEC(data, (err, res) => {
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'CREATE EMERGENCY CONTACT';
                process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            subAPIResponse = res;
            done();
        });
    });
 
    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });
});

describe(`Update Data Consent`, () => {
    before((done) => {
        data = {};
        data.vin = vin;
        data.subscriberGuid = subscriberGuid;
        data.dataConsent = {
            serviceConnect: 'True',
            can300: 'True',
            dealerContact: 'True',
            ub: 'True'
        };
        const subscriptionService = new SubscriptionService(oAuthToken);

        subscriptionService.updateDataConsent(data, (err, res) => {
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'UPDATE DATA CONSENT';
                process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            subAPIResponse = res;
            done();
        });
    });
 
    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });
});

describe(`Replace Remote User`, () => {
    before((done) => {
        data = {};
        data.vin = vin;
        data.subscriberGuid = subscriberGuid;
        data.remoteUserGuid = subscriberGuid;
        const subscriptionService = new SubscriptionService(oAuthToken);

        subscriptionService.replaceRemoteUser(data, (err, res) => {
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'REPLACE REMOTE USER';
                process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            subAPIResponse = res;
            done();
        });
    });
 
    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });
});

describe(`Cancel Subscription`, () => {
    before((done) => {
        data = {};
        data.vin = vin;
        data.subscriberGuid = subscriberGuid;
        data.vehicleStatus = "SOLD";
        const subscriptionService = new SubscriptionService(oAuthToken);

        subscriptionService.cancelSubscription(data, (err, res) => {
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'CANCEL SUBSCRIPTION';

                process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            subAPIResponse = res;
            done();
        });
    });
 
    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });
});

describe('Send Remote Auth Code By Email', ()=>{
    before((done) => {
        const racService = new RacService(oAuthToken);
        var request = {
            "vin": vin,
            "guid": subscriberGuid,
            "purpose": "REMOTE_AUTHORIZATION",
            "email": "karthik.vellaichamy@toyotaconnected.com",
            "validateByAgent": false,
            "sendNotification": true
        }

        racService.createRAC(request, (err, res) => {
            response = res;
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'SEND RAC';

                process.env.REQUEST_PAYLOAD = JSON.stringify(request);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                //console.log(process.env.RESPONSE_PAYLOAD);
            }
            done();
        });
    });

    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });
});

describe('Send Remote Auth Code By Phone', ()=>{
    before((done) => {
        const racService = new RacService(oAuthToken);
        var request = {
            "vin": vin,
            "guid": subscriberGuid,
            "purpose": "REMOTE_AUTHORIZATION",
            "phone": utils.randomPhoneNumber(),
            "validateByAgent": false,
            "sendNotification": true
        }

        racService.createRAC(request, (err, res) => {
            response = res;
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'SEND RAC';

                process.env.REQUEST_PAYLOAD = JSON.stringify(request);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            done();
        });
    });

    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });
});

describe('Override Remote Auth Code', ()=>{
    before((done) => {
        const racService = new RacService(oAuthToken);
        var request = {
        "vin": vin,
        "validateByAgent":true,
        "sendNotification":true,
        "purpose":"REMOTE_AUTHORIZATION",
        "phone":null,
        "guid":"5bfca75ec0ce4ae388273faff2a6ec2e",
        "email":null
    }

        racService.overrideRAC(request, (err, res) => {
            response = res;
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'OVERRIDE RAC';
                ////console.log(res.body);
                process.env.REQUEST_PAYLOAD = JSON.stringify(request);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            done();
        });
    });

    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });
});