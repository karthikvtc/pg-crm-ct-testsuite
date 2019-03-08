require('dotenv').config();

module.exports = function () {
    return {
        "QA": {
            "fdf_url": "https://cvs-fdfr.qa.telematicsct.com/v1/vehicle/fdf",
            "adf_url": "https://cvs-adfr.qa.telematicsct.com/v1/vehicle/adf",
            "adf_auth": process.env.QA_ADF_AUTH,
            "fdf_auth": process.env.QA_FDF_AUTH,
            "random_vin_url": "http://randomvin.com/getvin.php?type=real"
        },
        "DEV": {
            "fdf_url": "https://cvs-fdfr.dev.telematicsct.com/v1/vehicle/fdf",
            "adf_url": "https://cvs-adfr.dev.telematicsct.com/v1/vehicle/adf",
            "random_vin_url": "http://randomvin.com/getvin.php?type=real",
            "adf_auth": process.env.DEV_ADF_AUTH,
            "fdf_auth": process.env.DEV_FDF_AUTH
        },
        "STG": {
            "fdf_url": "https://cvs-fdfr.stg.telematicsct.com/v1/vehicle/fdf",
            "adf_url": "https://cvs-adfr.stg.telematicsct.com/v1/vehicle/adf",
            "random_vin_url": "http://randomvin.com/getvin.php?type=real",
            "adf_auth": process.env.STG_ADF_AUTH,
            "fdf_auth": process.env.STG_FDF_AUTH
        },
        "MAX_VIN": 5,
        "FILE_STORE": "./db_slack_bot_a"
    }
}();