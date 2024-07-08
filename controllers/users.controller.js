const bcrypt = require('bcrypt');
const User = require('../models/users.model')
const AsyncWraper = require('express-async-wrap');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { validationResult} = require('express-validator');


// sign up controller
const createUser_controller = AsyncWraper(async (req ,res)=>{
    const result = validationResult(req);
    if(result.isEmpty()){
        const {name,number,number_dad,gmail,grade,country,password} = req.body
    const oldUser = await User.findOne({number:number,gmail})  
    if(oldUser){
        return res.status(400).json({stauts:'FAIL',data:[],msg:'this user is already existed'})
    }
    else{
    const password_hased = await bcrypt.hash(password,10)
    const token = jwt.sign({name,gmail},process.env.JWT_SECRET_KEY)
    const new_user = new User({
        name,
        number,
        number_dad,
        gmail,
        grade,
        country,
        password:password_hased,
        token,
        loged:1,
    })
        await new_user.save();
        const newUser = await User.findOne({token:token,number:number},{_id:true}) 
        return res.status(200).json({status:'SUCCESS',data:[token,newUser._id]})
    }}else{
        return res.status(400).json({status:'FAIL',msg:'البيانات غير صحيحة',statusCode:400,data:0})
    }
})

// login controller
const login_controller = AsyncWraper(async ( req , res )=>{
    const result = validationResult(req);
    if(result.isEmpty()){
        const { number , password } = req.body;
        const user = await User.findOne({number})
        if(user){
        const result = await bcrypt.compare(password,user.password)
            if(result){
                if( +user.loged >= 2  ){
                    return res.status(400).json({status:"FAIL",statusCode:400,data:[],msg:"الحساب موجود على اكتر من حساب"})
                }
                else{
                    await User.updateOne({number},{loged: +user.loged + 1})
                    return res.status(200).json({status:"SUCCESS",data:[user.token,user._id]})
                }
            }
            else{
                return res.status(400).json({status:"FAIL",statusCode:400,data:[],msg:"البيانات غير صحيحة"})
            }
        }else{
            return res.status(400).json({status:"FAIL",statusCode:400,data:[],msg:"البيانات غير صحيحة"})
        }
    }else{
        return res.status(400).json({status:"FAIL",statusCode:400,data:[],msg:"البيانات غير صحيحة"})
    }
})

module.exports = {
    createUser_controller,
    login_controller
}