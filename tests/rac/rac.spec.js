require('dotenv').config();
const expect = require('chai').expect;
const mocha = require('mocha')
const tv4 = require('tv4');
const fs = require('fs');
const envNamePrefix = process.env.ENV;
const vinService = require(__dirname + '/../../vin-service')(envNamePrefix);
const RacService = require('../../api-service/rac');
const SubscriptionService = require('../../api-service/subscription');
const SubPreviewService = require('../../api-service/sub-preview');
const AccountService = require('../../api-service/account');
const OAuthService = require('../../api-service/oauth');
var oAuthToken;

const test_data = JSON.parse(fs.readFileSync(__dirname + '/../subscription/subscription.data', 'utf8'));
const utils = require('../../utils');

var response, response2, response3;
var vin;
var subscriptions = [];
var subscriberGuid, remoteUserGuid;
var data = test_data;
var subResponse = null;
var subItemResponse = null;

describe(`Remote Auth Code`, () => {
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
            vin = res.vin;
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
              subscriptions = res.body.payload.subscriptions;
            }
            done();
        });
    });
    before((done) => {
        data.vin = vin;
        data.subscriberGuid = subscriberGuid;
        data.remoteUserGuid = remoteUserGuid;
        data.subscriptions = subscriptions.filter((s)=>{return s.type === 'Trial'});
        const subscriptionService = new SubscriptionService(oAuthToken);

        subscriptionService.createSubscription(data, (err, res) => {
            if(err || res.statusCode != 200){
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
            var request = {"correlationId":"f465b0fc-1830-4797-a0a0-dbb85b9885f1",
            "brandPrefix":null,"vin":"1FTYR10DX9PA32428",
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
                    //////console.log(res.body);
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
});
