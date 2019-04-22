require('dotenv').config();
const expect = require('chai').expect;
const mocha = require('mocha')
const tv4 = require('tv4');
const fs = require('fs');
const envNamePrefix = process.env.ENV;
const vinService = require(__dirname + '/../../vin-service')(envNamePrefix);
const ZuoraPreviewService = require('../../api-service/zuora-preview');
const SubPreviewService = require('../../api-service/sub-preview');

var response;
var vin;
var subscriptions = {};
var payload, firstInvoiceItem;

describe(`Generate Zuora Preview API`, () => {
    before((done) => {
        vinService.createVin(true).then((res) => {
            vin = res;
            done();
        });
    });
    before((done) => {
        const subPreviewService = new SubPreviewService();
        subPreviewService.getAvailableSubscriptions(vin, (err, res) => {
            response = res;
            if (res.body.payload) {
                //console.log(res.body.payload.subscriptions);
                subscriptions = res.body.payload.subscriptions
                    .filter((x) => { return x.type == 'Paid' })
                    .map((x) => {
                        return {
                            ratePlanID:x.ratePlanID,
                            period: x.term,
                            periodType: x.termUnit === 'MTH' ? 'Month' : 'Days'
                        }
                    });
            }
            done();
        });
    });

    before((done) => {
        const zuoraPreviewService = new ZuoraPreviewService();
        var request = {
            city: 'Plano',
            state: 'Texas',
            country: 'United States',
            orderDate: "2019-04-04",
            "subscriptions": [
                {
                  "ratePlanID": "8adc8f996564fdb801656724bf3b389d",
                  "period": 12,
                  "periodType": "Month"
                }
              ]
        };
        request.subscriptions = subscriptions;
        zuoraPreviewService.getPreview(request, (err, res) => {
            response = res;
            if(err || res.statusCode != 200){
                process.env.REQUEST_PAYLOAD = JSON.stringify(request);
                process.env.RESPONSE_PAYLOAD = JSON.stringify(res.body);
            }
            if (res.body.payload) {
                payload = res.body.payload;
                firstInvoiceItem = payload.invoiceItems[0];
            }
            done();
        });
    });
    it('should return 200', () => {
        expect(response.status).to.equal(200);
    });

    it("should have totalAmount", () => {
        expect(payload.totalAmount).is.exist;
    });

    it("should have totalTaxAmount:", () => {
        expect(payload.totalTaxAmount).is.exist;
    });

    it("should have totalAmountWithoutTax:", () => {
        expect(payload.totalAmountWithoutTax).is.exist;
    });

    it("should have list of invoiceItems:", () => {
        expect(payload.invoiceItems).to.be.an('array');
        expect(payload.invoiceItems).to.have.lengthOf.above(0);
    });

    it("should have productName in firstInvoiceItem", () => {
        expect(firstInvoiceItem.productName).is.exist;
    });

    it("should have amountWithoutTax in firstInvoiceItem", () => {
        expect(firstInvoiceItem.amountWithoutTax).is.exist;
    });
    it("should have taxAmount in firstInvoiceItem", () => {
        expect(firstInvoiceItem.taxAmount).is.exist;
    });
});