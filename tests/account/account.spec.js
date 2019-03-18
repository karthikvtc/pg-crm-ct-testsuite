require('dotenv').config();
const expect = require('chai').expect;
const tv4 = require('tv4');
const fs = require('fs');
const schema = fs.readFileSync(__dirname + '/create-account.schema');
const test_data = JSON.parse(fs.readFileSync(__dirname + '/account.data', 'utf8'));
const accountService = require('../../api-service/account');
const utils = require('../../utils');

var response;
var account = {};
var data = test_data;
data.firstName = utils.randomStr(5);
data.lastName = utils.randomStr(5);
data.email = `${data.lastName}@test.com`;
data.phoneNumber = utils.randomPhoneNumber();

describe(`Create account API`, () => {
    before((done) => {
        accountService.createAccount(data, (err, res)=>{
            response = res;
;            if (res.body.payload) {
                account = res.body.payload.customer;
            }
            done();
        })
    });

    it('should return 201', () => {
        expect(response.status).to.equal(201);
    });

    it('should match the schema', async () => {
        expect(await tv4.validate(account, schema)).to.be.true;
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

describe(`Update account API`, () => {
    let homeAddress;
    before((done) => {
        data.firstName += '-edited';
        data.lastName += '-edited';
        data.preferredLanguage = 'es-pr';
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
        accountService.updateAccount(data, (err,res)=>{
            response = res;
            if(response.body.payload){
                account = response.body.payload.customer;
            }
            done();
        });
    });

    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });

    it('should match the schema', async () => {
        expect(await tv4.validate(account, schema)).to.be.true;
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
