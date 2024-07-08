const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller')
const {body , validationResult} = require('express-validator');


const User = require('../models/users.model')
const bcrypt = require('bcrypt');
const AsyncWraper = require('express-async-wrap');
const jwt = require('jsonwebtoken');
const multer = require('multer')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadsUser')
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = "user-" + Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + file.mimetype.split('/')[1]
        cb(null, uniqueSuffix)
      }
})
const upload = multer({storage})


// sign up 
router.post('/api/register',
    body('name').notEmpty(),
    body('number').notEmpty().matches(/^(012|010|015|011)/).isLength({min:11,max:11}).withMessage(''),
    body('number_dad').notEmpty().matches(/^(012|010|015|011)/).isLength({min:11,max:11}).withMessage(''),
    body('gmail').notEmpty().isEmail().withMessage(''),
    body('grade').notEmpty().withMessage(''),
    body('country').notEmpty().withMessage(''),
    body('password').notEmpty().withMessage(''),
    usersController.createUser_controller)
// login
router.post("/api/login",
    body('number').notEmpty().matches(/^(012|010|015|011)/).isLength({min:11,max:11}).withMessage(''),
    body('password').notEmpty().withMessage(''),
    usersController.login_controller)
// logout
router.post("/api/logout",AsyncWraper( async ( req , res )=>{
    const token = req.headers["token"]
    const user = await User.findOne({token})
    if(user){
        const loged = +user.loged;
        if(loged > 0){
            await User.updateOne({token},{loged:+user.loged - 1})
            return res.status(200).json({status:"SUCCESS",data:[],msg:"تم تسجيل الخروج بنجاح"})
        }else{
            return res.status(200).json({status:"SUCCESS",data:[],msg:"تم تسجيل الخروج بنجاح"})
        }
    }
    else{
        return res.status(400).json({status:"FAIL",statusCode:400,data:[],msg:"اليوزر مش موجود"})
    }
}))
// get profile
router.get('/api/profile/:userId',AsyncWraper( async( req , res )=>{
const userId = req.params['userId']
const userToken = req.headers['token']
jwt.verify(userToken,process.env.JWT_SECRET_KEY,async (err,decoded)=>{
    if(!err){
        const oldUserId = await User.findOne({token:userToken},{_id:true})
        if(oldUserId._id == userId){
            const dataUser = await User.findOne({token:userToken},{loged:false,token:false,__v:false,password:false})
            res.status(200).json({status:"SUCCESS",data:dataUser})
        }
        else{
            res.status(404).json({status:'FAIL',data:[],msg:"forbidden"})
        }
    }
    else{
        res.status(404).json({status:'FAIL',data:[],msg:"forbidden"})
    }
})
}))
// get user
router.get('/api/user' , AsyncWraper( async ( req , res )=>{
    const userToken = req.headers['token']
    jwt.verify(userToken,process.env.JWT_SECRET_KEY, async ( err , decoded )=>{
        if(!err){
            const user = await User.findOne({ token:userToken },{password:false,loged:false,gmail:false,token:false})
            res.status(200).json({status:"SUCCESS",data:user})
        }
        else{
            res.status(404).json({status:'FAIL',data:[],msg:"forbidden"})
        }
    })
}))
// edit profile
router.patch('/api/users/edit',
    upload.single('avatar'),
    body('name').notEmpty(),
    body('number').notEmpty().matches(/^(012|010|015|011)/).isLength({min:11,max:11}).withMessage(''),
    body('grade').notEmpty().withMessage(''),
    body('country').notEmpty().withMessage(''),
    AsyncWraper ( async( req , res )=>{
    const result = validationResult(req)
    if(result.isEmpty()){
        const token = req.headers['token']
        const { name , number , grade , country } = req.body
        const avatar = req.file.filename
        jwt.verify( token , process.env.JWT_SECRET_KEY , async ( err , decoded )=>{
            if(!err){
                const user = await User.findOne({token},{_id:true});
                if(user){
                    await User.updateOne({token},{ name , number , avatar , grade , country })
                    res.status(200).json({status:"SUCCESS"})
                }else{
                res.status(404).json({status:"FAIL",data:[],msg:"Invalide data"})
                }
            }else{
                res.status(404).json({status:"FAIL",data:[],msg:"Invalidd data"})
            }
        })
    }else{
        res.status(404).json({status:"FAIL",data:[],msg:result})
    }
}))



module.exports = router