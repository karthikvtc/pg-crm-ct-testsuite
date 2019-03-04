    module.exports = function() {
        return {
            randomStr: function (num) {
                return Math.random().toString(36).substring(num);
            },
            randomPhoneNumber: function(){
                return parseInt(Math.random().toString().slice(2,12));
            }
        }
    }()