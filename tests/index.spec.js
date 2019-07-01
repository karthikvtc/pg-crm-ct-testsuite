require('dotenv').config();
const expect = require('chai').expect;
const fs = require('fs');
const moment = require('moment');
const uuid = require('uuid');
const envNamePrefix = process.env.ENV;

const vinService = require(__dirname + '/../vin-service')(envNamePrefix);
const SubPreviewService = require('../api-service/sub-preview');
const RacService = require('../api-service/rac');
const SubscriptionService = require('../api-service/subscription');
const AccountService = require('../api-service/account');
const OAuthService = require('../api-service/oauth');
const utils = require('../utils');
const test_data = JSON.parse(fs.readFileSync(__dirname + '/subscription/subscription.data', 'utf8'));
var oAuthToken;
var response;
var vin, imei;
var subscriptions = [];
var subscriberGuid, remoteUserGuid;
var data = {};
var subResponse = null;
var subItemResponse = null;
var subAPIResponse = null;
const today = moment().format('YYYY-MM-DDTHH:mm:ss.SSS').toString() + '-0500';
let account = {};

describe(`CT API Test Suite`, () => {
    before((done) => {
        if (process.env.OAUTH === 'true') {
            const oauthService = new OAuthService();
            oauthService.getAuthToken((err, res) => {
                if (res.body) {
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
            imei = res.imei;
            done();
        });
    });

    describe(`Create account`, () => {
        before((done) => {
            const accountService = new AccountService(oAuthToken);
            data.firstName = 'TCAgent' + utils.randomStr(5);
            data.lastName = utils.randomStr(5);
            data.email = `${data.firstName}@tcAgenTestSuite.com`;
            data.phoneNumber = utils.randomPhoneNumber();
            data.preferredLanguage = 'en-US';

            accountService.createAccount(data, (err, res) => {
                response = res;
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'CREATE ACCOUNT';

                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                }
                if (res.body.payload) {
                    account = res.body.payload.customer;
                    subscriberGuid = account.guid;
                    remoteUserGuid = account.guid;
                }
                done();
            })
        });

        it('should return 201', () => {
            expect(response.status).to.equal(201);
        });

        it("should insert firstname and lastname", () => {
            expect(account.firstName).to.equal(data.firstName);
            expect(account.lastName).to.equal(data.lastName);
        });

        it("should insert email", () => {
            expect(account.emails[0].emailAddress).to.equal(data.email);
        });
        it("should insert phone", () => {
            expect(account.phoneNumbers[0].phoneNumber).to.equal(data.phoneNumber);
        });
        it("should insert preferred language", () => {
            expect(account.preferredLanguage).to.equal(data.preferredLanguage);
        });
    });

    describe(`Search account by email`, () => {
        let accountFound;
        before((done) => {
            const accountService = new AccountService(oAuthToken);

            accountService.searchAccount(data, (err, res) => {
                response = res;
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'SEARCH ACCOUNT';

                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                }
                if (response.body.payload) {
                    accountFound = response.body.payload.customer;
                }
                done();
            });
        });

        it('should return 200', () => {
            expect(response.status).to.equal(200);
        });

        it("should get an account with matching email", () => {
            expect(accountFound.emails[0].emailAddress).to.equal(data.email);
        });
    });

    describe(`Search account by phone number`, () => {
        let accountFound;
        before((done) => {
            delete data.email;
            data.phone = data.phoneNumber;
            const accountService = new AccountService(oAuthToken);
            accountService.searchAccount(data, (err, res) => {
                response = res;
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'SEARCH ACCOUNT';

                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                }
                if (response.body.payload) {
                    accountFound = response.body.payload.customer;
                }
                done();
            });
        });

        it('should return 200', () => {
            expect(response.status).to.equal(200);
        });

        it("should get an account with matching phone number", () => {
            expect(accountFound.phoneNumbers[0].phoneNumber).to.equal(data.phoneNumber);
        });
    });

    describe(`Update account information`, () => {
        let homeAddress;
        before((done) => {
            data.firstName += '-edited';
            data.lastName += '-edited';
            data.preferredLanguage = 'es-US';
            data.guid = account.guid;
            data.objectId = account.objectId;
            data.addresses = [];
            homeAddress = {
                addressType: 'HOME',
                address: 'Test data',
                state: 'TX',
                city: 'Plano',
                country: 'US',
                zipCode: '75024'
            };
            data.addresses.push(homeAddress);
            delete data.email;
            delete data.phoneNumber;
            delete data.customerType;
            const accountService = new AccountService(oAuthToken);
            accountService.updateAccount(data, (err, res) => {
                response = res;
                if (response.body.payload) {
                    account = response.body.payload.customer;
                }
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'UPDATE ACCOUNT';

                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                }
                done();
            });
        });

        it('should return 200', () => {
            expect(response.status).to.equal(200);
        });

        it("should update firstname and lastname", () => {
            expect(account.firstName).to.equal(data.firstName);
            expect(account.lastName).to.equal(data.lastName);
        });

        it("should update preferred language", () => {
            expect(account.preferredLanguage).to.equal(data.preferredLanguage);
        });

        it("should have updated home address", () => {
            expect(account.addresses.length).to.equal(1);
        });

        it("should set address type to HOME", () => {
            expect(account.addresses[0].addressType).to.equal(homeAddress.addressType);
        });

        it("should update home street", () => {
            expect(account.addresses[0].address).to.equal(homeAddress.address);
        })
        it("should update home city", () => {
            expect(account.addresses[0].city).to.equal(homeAddress.city);
        })
        it("should update home state", () => {
            expect(account.addresses[0].state).to.equal(homeAddress.state);
        })
        it("should update home country", () => {
            expect(account.addresses[0].country).to.equal(homeAddress.country);
        })
        it("should update home zipcode", () => {
            expect(account.addresses[0].zipCode).to.equal(homeAddress.zipCode);
        })
    });

    describe(`Send Verification Code to Email`, () => {
        let homeAddress;
        before((done) => {
            var data = {};
            data.to = 'email';
            data.guid = account.guid;
            const accountService = new AccountService(oAuthToken);
            accountService.sendVerificationCode(data, (err, res) => {
                response = res;
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'SEND VERIFICATION CODE TO EMAIL';

                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                }
                done();
            });
        });

        it('should return 201', () => {
            expect(response.status).to.equal(201);
        });
    });

    describe(`Send Verification Code to Phone`, () => {
        let homeAddress;
        before((done) => {
            let data = {};
            data.to = 'phone';
            data.guid = account.guid;
            const accountService = new AccountService(oAuthToken);
            accountService.sendVerificationCode(data, (err, res) => {
                response = res;
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'SEND VERIFICATION CODE TO Phone';

                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                    //console.log(process.env.RESPONSE_PAYLOAD);
                    //console.log(process.env.REQUEST_PAYLOAD);
                }
                done();
            });
        });

        it('should return 201', () => {
            expect(response.status).to.equal(201);
        });
    });

    describe(`Get Available Subscriptions`, () => {
        before((done) => {
            const subPreviewService = new SubPreviewService(oAuthToken);
            subPreviewService.getAvailableSubscriptions(vin, (err, res) => {
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'GET SUB PREVIEW';
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                    ////console.log(process.env.RESPONSE_PAYLOAD);
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

        it("should have ratePlanID", () => {
            expect(availableSubscription.ratePlanID).to.not.be.empty;
        });

        it("should have termUnit", () => {
            expect(availableSubscription.termUnit).is.exist;
        });

        it("should have type", () => {
            expect(availableSubscription.type).is.exist;
        });

        it("should have type matching Trial or Paid", () => {
            expect(availableSubscription.type).to.be.oneOf(['Trial', 'Paid']);
        });

        it("should have subscriptionEndDate", () => {
            expect(availableSubscription.subscriptionEndDate).is.exist;
        });
    });

    describe(`Create Trial Subscription `, () => {
        //Create Subscription
        before((done) => {
            data = test_data;
            data.vin = vin;
            data.subscriberGuid = subscriberGuid;
            data.remoteUser = { remoteUserGuid };
            data.paymentMethodId = null;
            data.termsAcceptanceDate = today;
            data.createDate = today;
            data.subscriptions = subscriptions.filter((s) => { return s.type === 'Trial' });
            const subscriptionService = new SubscriptionService(oAuthToken);
            //console.log(data);
            subscriptionService.createSubscription(data, (err, res1) => {
                if (err || res1.statusCode != 200) {
                    process.env.API_NAME = 'CREATE SUBSCRIPTION';

                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res1.body);
                    //console.log(process.env.RESPONSE_PAYLOAD);
                }
                subAPIResponse = res1;
                if (res1.body) {
                    subResponse = res1.body.payload;
                    if (res1.body.payload && res1.body.payload.subscriptions) {
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

    describe(`Create Emergency Contact`, () => {
        before((done) => {
            data = {};
            data.vin = vin;
            data.subscriberGuid = subscriberGuid;
            data.emergencyContact = {
                firstName: 'testfn',
                lastName: 'testln',
                phoneNumber: '2141231234'
            };
            const subscriptionService = new SubscriptionService(oAuthToken);

            subscriptionService.createEC(data, (err, res) => {
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'CREATE EMERGENCY CONTACT';
                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                }
                response = res;
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
                ubi: 'True'
            };
            const subscriptionService = new SubscriptionService(oAuthToken);

            subscriptionService.updateDataConsent(data, (err, res) => {
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'UPDATE DATA CONSENT';
                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                }
                response = res;
                done();
            });
        });

        it('should return 200', () => {
            expect(response.status).to.equal(200);
        });
    });

    describe(`Replace Remote User`, () => {
        //Create Remote user Account
        before((done) => {
            account = {};
            account.firstName = 'remoteuser' + utils.randomStr(5);
            account.lastName = utils.randomStr(5);
            account.email = `${account.firstName}@tcAgentTestSuite.com`;
            account.phoneNumber = utils.randomPhoneNumber();
            const accountService = new AccountService(oAuthToken);
            accountService.createAccount(account, (err, res) => {
                if (res.body.payload) {
                    remoteUserGuid = res.body.payload.customer.guid;
                }
                done();
            });
        });
        before((done) => {
            data = {};
            data.vin = vin;
            data.subscriberGuid = subscriberGuid;
            data.remoteUserGuid = remoteUserGuid;
            const subscriptionService = new SubscriptionService(oAuthToken);
            subscriptionService.replaceRemoteUser(data, (err, res) => {
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'REPLACE REMOTE USER';
                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                }
                response = res;
                done();
            });
        });

        it('should return 200', () => {
            expect(response.status).to.equal(200);
        });
    });

    describe('Send Remote Auth Code By Email', () => {
        before((done) => {
            const racService = new RacService(oAuthToken);
            var request = {
                "vin": vin,
                "guid": subscriberGuid,
                "purpose": "REMOTE_AUTHORIZATION",
                "validateByAgent": false,
                "sendNotification": true,
                "notifyByEmail": true,
                "notifyByPhone": false
            }

            racService.createRAC(request, (err, res) => {
                response = res;
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'SEND RAC BY EMAIL';

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

    describe('Send Remote Auth Code By Phone', () => {
        before((done) => {
            const racService = new RacService(oAuthToken);
            var request = {
                "vin": vin,
                "guid": subscriberGuid,
                "validateByAgent": false,
                "sendNotification": true,
                "purpose": "REMOTE_AUTHORIZATION",
                "notifyByEmail": false,
                "notifyByPhone": true
            };

            racService.createRAC(request, (err, res) => {
                response = res;
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'SEND RAC BY PHONE';

                    process.env.REQUEST_PAYLOAD = JSON.stringify(request);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                    console.log(process.env.RESPONSE_PAYLOAD);
                }
                done();
            });
        });

        it('should return 200', () => {
            expect(response.status).to.equal(200);
        });
    });

    describe('Override Remote Auth Code', () => {
        before((done) => {
            const racService = new RacService(oAuthToken);
            var request = {
                "vin": vin,
                "guid": subscriberGuid,
                "validateByAgent": true,
                "sendNotification": true,
                "purpose": "REMOTE_AUTHORIZATION",
                "notifyByEmail": false,
                "notifyByPhone": false
            };

            racService.overrideRAC(request, (err, res) => {
                response = res;
                if (err || res.statusCode != 200) {
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

    describe('Start Wifi Trial', () => {
        before((done) => {
            const subService = new SubscriptionService(oAuthToken);
            var request = {
                "vin": vin,
                "transId": uuid.v4(),
                "deviceIdType": 'IMEI',
                "deviceId": imei,
                "firstName": account.firstName,
                "lastName": account.lastName,
                "primaryCallBackNum": account.phoneNumber,
                "primaryEmail": account.email,
                "country": 'US',
                "tncAcceptDate": today,
                "language": "E"
            };
            //console.log(request);

            subService.createWifiTrial(request, (err, res) => {
                response = res;
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'WIFI TRIAL';
                    process.env.REQUEST_PAYLOAD = JSON.stringify(request);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                    // console.log(process.env.RESPONSE_PAYLOAD);
                }
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
            data.canceledReason = 'No longer own vehicle';
            const subscriptionService = new SubscriptionService(oAuthToken);

            subscriptionService.cancelSubscription(data, (err, res) => {
                if (err || res.statusCode != 200) {
                    process.env.API_NAME = 'CANCEL SUBSCRIPTION';

                    process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                    process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                }
                response = res;
                done();
            });
        });

        it('should return 200', () => {
            expect(response.status).to.equal(200);
        });
    });
})