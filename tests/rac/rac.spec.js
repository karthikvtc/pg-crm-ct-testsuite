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

const test_data = JSON.parse(fs.readFileSync(__dirname + '/../subscription/subscription.data', 'utf8'));
const utils = require('../../utils');

var response, response2, response3;
var vin;
var subscriptions = [];
var subscriberGuid, remoteUserGuid;
var data = test_data;
var subResponse = null;
var subItemResponse = null;

describe(`Remote Auth Code `, () => {
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
        const accountService = new AccountService();
        accountService.createAccount(account, (err,res) => {
            if (res.body.payload) {
                subscriberGuid = res.body.payload.customer.guid;
                remoteUserGuid = subscriberGuid;
            }
            done();
        });
    });
    before((done) => {
        const subPreviewService = new SubPreviewService();

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
        const subscriptionService = new SubscriptionService();

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

    before((done) => {
        const racService = new RacService();
        var racPayload = {
            "vin": vin,
            "guid": subscriberGuid,
            "purpose": "REMOTE_AUTHORIZATION",
            "email": "karthik.vellaichamy@toyotaconnected.com",
            "validateByAgent": false,
            "sendNotification": true
        }

        racService.createRAC(racPayload, (err, res) => {
            response = res;
            if(err || res.statusCode != 200){
                console.log('-------------- REQUEST --------------');
                console.log(data);
                console.log('-------------- RESPONSE --------------');
                console.log(JSON.stringify(res.body));
            }
           
            racPayload.phone = utils.randomPhoneNumber();
            racService.createRAC(racPayload, (err, res) => {
                response2 = res;
                if(err || res.statusCode != 200){
                    console.log('-------------- REQUEST --------------');
                    console.log(data);
                    console.log('-------------- RESPONSE --------------');
                    console.log(JSON.stringify(res.body));
                }
                
                racService.createRAC(racPayload, (err, res) => {
                    response3 = res;
                    if(err || res.statusCode != 200){
                        console.log('-------------- REQUEST --------------');
                        console.log(data);
                        console.log('-------------- RESPONSE --------------');
                        console.log(JSON.stringify(res.body));
                    }
                    done();
                });
            });
        });
    });

    it('By Email should return 200', () => {
        expect(response.status).to.equal(200);
    });

    it('By Phone should return 200', () => {
        expect(response2.status).to.equal(200);
    });

    it('Override should return 200', () => {
        expect(response3.status).to.equal(200);
    });
});
