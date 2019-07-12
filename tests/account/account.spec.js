require('dotenv').config();
const expect = require('chai').expect;
const tv4 = require('tv4');
const fs = require('fs');
const test_data = JSON.parse(fs.readFileSync(__dirname + '/account.data', 'utf8'));
const utils = require('../../utils');
const AccountService = require('../../api-service/account');
const OAuthService = require('../../api-service/oauth');
var oAuthToken;
var response;
var account = {};
var data = test_data;

data.firstName = utils.randomStr(5);
data.lastName = utils.randomStr(5);
data.email = `${data.lastName}@test.com`;
data.phoneNumber = utils.randomPhoneNumber();

describe(`Create account API`, () => {
    before((done) => {
        const envNamePrefix = process.env.OAUTH;
        if(process.env.OAUTH == 'true'){
            const oauthService = new OAuthService();
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
        const accountService = new AccountService(oAuthToken);
        accountService.createAccount(data, (err, res)=>{
            response = res;
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'CREATE ACCOUNT';

                process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            if (res.body.payload) {
                account = res.body.payload.customer;
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

        accountService.searchAccount(data, (err,res)=>{
            response = res;
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'SEARCH ACCOUNT';

                process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            if(response.body.payload){
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
        accountService.searchAccount(data, (err,res)=>{
            response = res;
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'SEARCH ACCOUNT';

                process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            if(response.body.payload){
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
        accountService.updateAccount(data, (err,res)=>{
            response = res;
            if(response.body.payload){
                account = response.body.payload.customer;
            }
            if(err || res.statusCode != 200){
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
        accountService.sendVerificationCode(data, (err,res)=>{
            response = res;
            if(err || res.statusCode != 200){
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
        accountService.sendVerificationCode(data, (err,res)=>{
            response = res;
            if(err || res.statusCode != 200){
                process.env.API_NAME = 'SEND VERIFICATION CODE TO Phone';

                process.env.REQUEST_PAYLOAD = JSON.stringify(data);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
                //////console.log(process.env.RESPONSE_PAYLOAD);
                //////console.log(process.env.REQUEST_PAYLOAD);
            }
            done();
        });
    });

    it('should return 201', () => {
        expect(response.status).to.equal(201);
    });
});