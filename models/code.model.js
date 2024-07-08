const mongoose = require('mongoose');

const wallet_Schema = new mongoose.Schema({
    code:{
        required:true,
        type:String
    }
})
const Wallet = mongoose.model('wallet',wallet_Schema)


module.exports = Wallet