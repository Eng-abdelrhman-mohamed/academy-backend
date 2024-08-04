const mongoose = require('mongoose');

const user_Schema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true,
    },
    number_dad: {
        type: String,
        required: true,
        unique: false
    },
    name: {
        type: String,
        required: true,
    },
    gmail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 8,
    },
    wallet: {
        type: Number,
        default: 0,
    },
    grade: {
        type: String,
        required: true 
    },
    country: {
        type: String,
        required: true 
    },
    courses: {
        type: Array
    },
    loged: {
        type: Number,
        default: 0
    },
    token: {
        type: String,
        required: true 
    },
    avatar: {
        type: String,
        default: 'profile.jpg'
    },
    subscription: [{
        name: String,
        purchaseDate: {
            type: Date,
            required: true
        },
    }],
    transactions: [
        {
            mode: {
                type: Boolean, 
                required: true
            },
            title: {
                type: String, 
                required: true
            },
            date: {
                type: Date, 
                default: Date.now()
            },
            money: {
                type: Number,
                required: true
            }
        }
    ],
    mounths:[
        {
            id_of_mounth:{
                type:String,
                required:true
            }
        }
    ]
});

const User = mongoose.model('User', user_Schema);

module.exports = User;
