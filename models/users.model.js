const mongoose = require('mongoose');

const user_Schema = new mongoose.Schema({
    number:{
        type:String,
        required:true,
        unique:true,
    },
    number_dad:{
        type:String,
        required:true,
        unique:false
    },
    name:{
        type:String,
        required:true,
    },
    gmail:{
    type:String,
    required:true,
    unique:true
    },
    password:{
        type:String,
        required:true,
        min:8,
    },
    wallet:{
        type:Number,
        default:0,
    },
    grade:{
        type:String,
        reuired:true
    },
    country:{
        type:String,
        requied:true
    },
    courses:{
        type:Array
    },
    loged:{
        type:Number,
        default:0
    },
    token:{
       type:String,
       requied:true 
    },
    avatar:{
        type:String,
        default:'profile.jpg'
    }
})
const User = mongoose.model('users',user_Schema)


module.exports = User