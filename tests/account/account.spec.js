require('dotenv').config();
const supertest = require('supertest');
const expect = require('chai').expect;
const mocha = require('mocha')
const tv4 = require('tv4');
const fs = require('fs');
const utils = require('../../utils');
const envNamePrefix = process.env.ENV;
const config = JSON.parse(fs.readFileSync(__dirname + '/account.config'))[envNamePrefix];
const schema = fs.readFileSync(__dirname + '/create-account.schema');
const test_data = JSON.parse(fs.readFileSync(__dirname + '/account.data', 'utf8'));
const apiEndPoint = config.apiEndPoint;

config.authKey = process.env[`${envNamePrefix}_CT_ACCOUNT_AUTH_KEY`];
var response;
var account = {};
var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CHANNEL': 'TC_AGENT',
    'X-CORRELATIONID': '123e4567-e89b-12d3-a456-abhishek0002',
    'Authorization': config.authKey
};
var data = test_data;
data.firstName = utils.randomStr(5);
data.lastName = utils.randomStr(5);
data.email = `${data.lastName}@test.com`;
data.phoneNumber = utils.randomPhoneNumber();

describe(`Create account`, () => {
    before((done) => {
        const api = supertest(config.createAccountBaseUrl);
        api.post(apiEndPoint)
            .set(headers)
            .send(data)
            .end((err, res)=>{
                response = res;
                if (res.body.payload) {
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

describe(`Update account`, () => {
    before((done) => {
        const api = supertest(config.updateAccountBaseUrl);

        data.firstName += '-edited';
        data.lastName += '-edited';
        data.preferredLanguage = 'es-pr';
        data.guid = account.guid;
        data.objectId = account.objectId;
        delete data.email;
        delete data.phoneNumber;
        delete data.customerType;
        const payload = {
            customer: data
        }
        api.put(apiEndPoint)
            .set(headers)
            .send(payload)
            .end((err,res)=>{
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
});
