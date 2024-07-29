const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    mounth:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    grade:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    discount:{
        type:Boolean,
        required:true
    },
    mini_price:{
        type:Number,
        required:false,
    },
    finish:{
        type:Boolean,
        required:true
    },
    courses:[{
        title:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true
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
        },
        discount:{
            type:Boolean,
            required:true
        },
        mini_price:{
            type:Number,
            required:false,
        },
        users:{
            type:Array,
            required:false
        },
        time:{
            type:String,
            required:true
        }
    }]
})

module.exports = mongoose.model("grade",gradeSchema)

// title:{
//     type:String,
//     required:true
// },
// price:{
//     type:Number,
//     required:true
// },
// grade:{
//     type:String,
//     required:true,
// },
// subject:{
//     type:String,
//     required:true,
// },
// avatar:{
//     type:String,
//     required:true
// },
// video:{
//     type:String,
//     required:true,
// },
// date:{
//     type:String,
//     default: Date.now()
// },
// discount:{
//     type:String,
//     required:true
// },
// mini_price:{
//     type:Number,
//     required:false,
// },
// watched:{
//     type:Number,
//     required:false,
//     default:0
// },
// users:{
//     type:Array,
//     required:false
// }