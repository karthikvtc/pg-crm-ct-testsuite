const request = require('request');
const imei = require('./imei-generator');

module.exports = function (env) {
    const config = require('./config')[env];
    const vinService = {
        createVin: async (dummy) => {
            return new Promise(async (resolve, reject) => {
                let imei = vinService.generateIMEI();
                let res = await vinService.generateVin();

                if (res && is2xxSuccess(res.statusCode)) {
                    let vin = res.body;
                    if(!dummy){
                        await vinService.registerInADF(vin, imei);
                        await vinService.registerInFDF(vin, imei);
                    }
                    resolve(vin);
                } else {
                    resolve(null);
                }
            });
        },

        generateVin: async () => {
            const options = {
                url: config.random_vin_url
            }
            return new Promise((resolve, reject) => {
                request.get(options, (err, res, body) => {
                    if (err) {
                        reject(new Error(err));
                    } else {
                        resolve(res);
                    }
                })
            })
        },

        generateIMEI: function () {
            return imei.generate()
        },

        registerInFDF: async (vin, imei) => {
            let payload = {
                "hardwareType": "010",
                "dcmModelYear": "19",
                "manufacturedDate": "2018-12-09",
                "colorCode": "02PT",
                "marketingColor": "SILVER METALLIC",
                "processedDate": "2018-12-22",
                "modelYear": "2019",
                "modelCode": "2550",
                "modelDescription": "CAMRY 4-DOOR XSE V6 SEDAN",
                "regionCode": "800",
                "brandCode": "TOY",
                "asiCode": "AP",
                "katashikiCode": "ZET03003050383057283",
                "countryCode": "104",
                "plantCode": "U",
                "headUnit": {
                    "mobilePlatformCode": "T02",
                    "huDescription": "T02 Headunit"
                }
            };
            let headers = {
                "X-CorrelationId": "cba867c7-5647-4a76-a73a-d5284b154623",
                "X-API-KEY": config.fdf_auth,
                "Content-Type": "application/json",
                "X-Channel": "TEST"
            }

            payload.vin = vin;
            payload.imei = imei;

            return new Promise((resolve, reject) => {
                request.post({
                    url: `${config.fdf_url}`,
                    json: true,
                    headers: headers,
                    body: payload
                }, (err, res, body) => {
                    if (err) {
                        reject(new Error(err));
                    } else {
                        resolve(res);
                    }
                })
            })
        },

        registerInADF: async (vin, imei) => {
            let payload = {
                "dcmModelYear": "19",
                "dcmDestination": "2",
                "countryCode": "104",
                "dcmSupplier": "64",
                "dcmGrade": "1",
                "euiccid": "17165424425181764875667666853541",
                "vehicleUnitTerminalNumber": "00000000000000000",
                "hardwareType": "010",
                "imei": imei,
                "oldImei": ""
            };
            let headers = {
                "X-CorrelationId": "053bea83-04dd-476e-9e51-280ac7018d42",
                "Authorization": config.adf_auth,
                "Content-Type": "application/json",
                "X-Channel": "ADMIN"
            }

            return new Promise((resolve, reject) => {
                request.post({
                    url: `${config.adf_url}/${vin}`,
                    json: true,
                    headers: headers,
                    body: payload
                }, (err, res, body) => {
                    if (err) {
                        reject(new Error(err));
                    } else {
                        resolve(res);
                    }
                })
            })
        }
    }

    return vinService;
}

function is2xxSuccess(code) {
    return parseInt(code / 100) === 2;
}