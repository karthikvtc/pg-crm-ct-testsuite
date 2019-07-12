    module.exports = function() {
        return {
            randomStr: function (num) {
                var result           = '';
                var characters       = 'abcdefghijklmnopqrstuvwxyz';
                var charactersLength = characters.length;
                for ( var i = 0; i < num; i++ ) {
                   result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            },
            randomPhoneNumber: function(){
                return parseInt(Math.random().toString().slice(2,12));
            },
            log: function (msg){
                if(process.env.DEBUG){
                    ////////console.log(msg);
                }
            }
        }
    }()