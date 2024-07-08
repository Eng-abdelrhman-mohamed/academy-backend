const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    grade:{
        type:String,
        required:true,
    },
    subject:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
        required:true
    },
    video:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        default: Date.now()
    }
})

module.exports = mongoose.model("grade",gradeSchema)