const express = require('express')
const router = express.Router();
const Grade = require('../models/grade.model');
const AsyncWraper = require('express-async-wrap');
const User = require('../models/users.model');
const jwt = require('jsonwebtoken');

const multer = require('multer')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploadsVideo')
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = "subject-" + Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + file.mimetype.split('/')[1]
        cb(null, uniqueSuffix)
      }
})
const upload = multer({storage})

// create course
router.post("/api/grade",upload.single('avatar'), AsyncWraper ( async ( req , res )=>{
const { title , price , grade , subject , video } = req.body;
const avatar = req.file.filename

    const newGrade = new Grade({
    title,
    price,
    grade,
    subject,
    avatar,
    video
    })
    await newGrade.save();
    res.status(201).json({status:"SUCCESS",msg:"course have been created"})
}))

// get grade 10 course with subject name

router.get('/api/grade10/:name_subject', AsyncWraper ( async ( req , res )=>{
    const subjectName = req.params["name_subject"]
    const grade10_courses = await Grade.find({grade:"grade10",subject:subjectName},{__v:false,video:false})
    res.status(200).json({status:"SUCCESS",data:grade10_courses})
}))
// get grade 11 course with subject name

router.get('/api/grade11/:name_subject', AsyncWraper ( async ( req , res )=>{
    const subjectName = req.params["name_subject"]
    const grade11_courses = await Grade.find({grade:"grade11",subject:subjectName},{__v:false,video:false})
    res.status(200).json({status:"SUCCESS",data:grade11_courses})
}))

// get grade 12 course with subject name

router.get('/api/grade12/:name_subject', AsyncWraper ( async ( req , res )=>{
    const subjectName = req.params["name_subject"]
    const grade12_courses = await Grade.find({grade:"grade12",subject:subjectName},{__v:false,video:false})
    res.status(200).json({status:"SUCCESS",data:grade12_courses})
}))

// buy course

router.get('/api/courses/:course_id', AsyncWraper ( async ( req , res )=>{
    const token = req.headers['token']
    const courseId = req.params['course_id']
    const course = await Grade.find({_id:courseId},{price:true})
    const user = await User.find({token},{wallet:true,courses:true})
    const courses = user[0].courses;
    
    let check = false
    if(user){
        if(course){
            for(i=0 ; i < courses.length ; i++){
                if(courses[i].id == courseId){
                check = true
                }
            }
            if(!check){
                if(user[0].wallet >= course[0].price){
                    const new_courses = [];
                    const object = {};
                    object.again = 3;
                    object.id = courseId;
                    
                    if(courses[0] == [][0]){
                    new_courses.push(object) 
                    await User.updateOne({token},{wallet:user[0].wallet - course[0].price,courses:new_courses})
                    }else{
                    new_courses.push(...courses) 
                    new_courses.push(object) 
                        await User.updateOne({token},{wallet:user[0].wallet - course[0].price,courses:new_courses})
                    }
                    
                res.status(200).json({status:"SUCCESS",data:[]})
                }else{
                    res.status(404).json({status:"FAIL",data:[],msg:"you dont have enough money"})
                }
            }else{
                res.status(404).json({status:"FAIL",data:[],msg:"you have this course already"})
            }
        }else{
            res.status(404).json({status:"FAIL",data:[],msg:"this course is not existed"})
        }
    }
    else{
        res.status(404).json({status:"FAIL",data:[],msg:"you dont have account"})
    }
}))

// الدخول للكورس
router.get('/api/:course_id' , AsyncWraper ( async (req ,res)=>{
    const course_id = req.params['course_id']
    const token = req.headers['token']
    jwt.verify(token,process.env.JWT_SECRET_KEY, async ( err , decoded ) =>{
        if(!err){
            const find_user = await User.findOne({token},{courses:true})
            if(find_user){
                const courses = find_user.courses
                let check = false
                let again ;
                for(i = 0 ; i < courses.length ; i++){
                    if(courses[i].id == course_id){
                        check = true;
                        again = courses[i].again;
                    }
                }
                if(check && again > 0 ){
                    const data_course = await Grade.find({_id:course_id})
                    if(again != 1){
                        await User.updateOne({token,'courses.id':course_id},{ $set: { 'courses.$.again': (again - 1) } })
                    }else{
                        await User.updateOne({token},{ $pull: { courses: {id : course_id} } })
                    }
                    
                    res.status(200).json({status:"SUCCESS",data:data_course})
                }else{
                res.status(404).json({status:"FAIL",data:[],msg:"اشتري الكورس الأول"})
                }
            }
            else{
                res.status(404).json({status:"FAIL",data:[],msg:"this user is not defiend"})
            }
        }
        else{
            res.status(404).json({status:"FAIL",data:[],msg:err.message})
        }
    })
}))

module.exports = router

