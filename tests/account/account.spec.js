const supertest = require('supertest');
const expect = require('chai').expect;
const mocha = require('mocha')
const tv4 = require('tv4');
const fs = require('fs');
const utils = require('../../utils');

const config = JSON.parse(fs.readFileSync('./tests/account/account.config'));
const schema = fs.readFileSync('./tests/account/create-account.schema');
const test_data = JSON.parse(fs.readFileSync('./tests/account/account.data', 'utf8'));

const apiEndPoint = config.apiEndPoint;

var response;
var account;
var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CHANNEL': 'TC_AGENT',
    'X-CORRELATIONID': '123e4567-e89b-12d3-a456-abhishek0002',
    'Authorization': 'W3iQu6eg7C89QH9ampgJu3gDTiRokMbv8WwNGGKc'
};
var data = test_data;
data.firstName = utils.randomStr(5);
data.lastName = utils.randomStr(5);
data.email = `${data.lastName}@test.com`;
data.phoneNumber = utils.randomPhoneNumber();

describe(`Create account`, function () {
    before(async function () {
        const api = supertest(config.createAccountBaseUrl);
        response = await api.post(apiEndPoint)
            .set(headers)
            .send(data);
        account = response.body.payload.customer;
    });

    it('should return 201', function () {
        expect(response.status).to.equal(201);
    });

    it('should match the schema', async function () {
        expect(await tv4.validate(account, schema)).to.be.true;
    });

    it("should insert firstname and lastname", function () {
        expect(account.firstName).to.equal(data.firstName);
        expect(account.lastName).to.equal(data.lastName);
    });

    it("should insert email", function () {
        expect(account.emails[0].emailAddress).to.equal(data.email);
    });
    it("should insert phone", function () {
        expect(account.phoneNumbers[0].phoneNumber).to.equal(data.phoneNumber);
    });
    it("should insert preferred language", function () {
        expect(account.preferredLanguage).to.equal(data.preferredLanguage);
    });
});

describe(`Update account`, function () {
    before(async function () {
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
        response = await api.put(apiEndPoint)
            .set(headers)
            .send(payload);
        account = response.body.payload.customer;
    });

    it('should return 200', function () {
        expect(response.status).to.equal(200);
    });

    it('should match the schema', async function () {
        expect(await tv4.validate(account, schema)).to.be.true;
    });

    it("should update firstname and lastname", function () {
        expect(account.firstName).to.equal(data.firstName);
        expect(account.lastName).to.equal(data.lastName);
    });

    it("should update preferred language", function () {
        expect(account.preferredLanguage).to.equal(data.preferredLanguage);
    });
});
