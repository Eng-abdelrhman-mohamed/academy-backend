const express = require('express')
const router = express.Router();
const Grade = require('../models/grade.model');
const AsyncWraper = require('express-async-wrap');
const User = require('../models/users.model');
const jwt = require('jsonwebtoken');
const multer = require('multer')
const cloudinary = require('cloudinary')




    cloudinary.config({ 
        cloud_name: 'da1ydpcew', 
        api_key: '817781158729924', 
        api_secret: 'xfY6fTnDVsGv3hms05xm5w16F3A' // Click 'View Credentials' below to copy your API secret
    });
    


const storage = multer.diskStorage({
      filename: function (req, file, cb) {
        const uniqueSuffix = "subject-" + Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + file.mimetype.split('/')[1]
        cb(null, uniqueSuffix)
      }
})
const upload = multer({storage})

// create mounth
router.post('/api/grade/mounth', AsyncWraper( async ( req , res )=>{
        const { mounth , price , grade , subject  , discount , mini_price , finish } = req.body;
        const newMounth = new Grade({
            mounth,
            price,
            grade,
            subject,
            discount,
            mini_price,
            finish
        })
        await newMounth.save()
        res.status(201).json({status:"SUCCESS",msg:"mounth have been created"})
    })
)
// create course new
router.post('/api/grade/:id_mounth',upload.single('avatar'),AsyncWraper ( async ( req , res )=>{
    const id_mounth = req.params["id_mounth"]
    const { title , price , video , discount , mini_price , time } = req.body;
    cloudinary.uploader.upload(req.file.path,async(result,err)=>{
        if(!err){
            const is_mounth = await Grade.findOne({_id:id_mounth},{courses:true})
            if(is_mounth){
                const new_courses = [...is_mounth.courses,{
                    title,
                    price,
                    avatar:result.url,
                    video,
                    discount,
                    mini_price,
                    time}]
                    is_mounth.courses = new_courses
                    await is_mounth.save()
                    res.status(201).json({status:"SUCCESS",msg:"course have been created"})
            }else{
                res.status(404).json({status:"FAIL",msg:"this mounth is not exicted"})
            
            }

        }
        else{
            res.status(500).json({status:"FAIL",data:[]})
        }
    })
}))
// create course
router.post("/api/grade",upload.single('avatar'), AsyncWraper ( async ( req , res )=>{
const { title , price , grade , subject , video , discount , mini_price} = req.body;


cloudinary.uploader.upload(req.file.path,async(result,err)=>{
    if(!err){
        const newGrade = new Grade({
            title,
            price,
            grade,
            subject,
            avatar:result.url,
            video,
            discount,
            mini_price,
            })
            await newGrade.save();
            res.status(201).json({status:"SUCCESS",msg:"course have been created"})
        
    }
    else{
        res.status(500).json({status:"FAIL",data:[]})
    }
})
}))
// get grade 10 course with subject name

router.get('/api/grade10/:name_subject', AsyncWraper ( async ( req , res )=>{
    const subjectName = req.params["name_subject"]
    const grade10_courses = await Grade.find({grade:"grade10",subject:subjectName})
        const filteredCourses = grade10_courses.map(course => {
            const modifiedCourses = course.courses.map(subCourse => {
                const { video, ...rest } = subCourse.toObject();
                return rest;
                });
            return {
            ...course.toObject(), 
            courses: modifiedCourses 
            };
        });
    res.status(200).json({status:"SUCCESS",data:filteredCourses})
}))
// get grade 11 course with subject name
router.get('/api/grade11/:name_subject', AsyncWraper ( async ( req , res )=>{
    const subjectName = req.params["name_subject"]
    const grade11_courses = await Grade.find({grade:"grade11",subject:subjectName})
        const filteredCourses = grade11_courses.map(course => {
            const modifiedCourses = course.courses.map(subCourse => {
                const { video, ...rest } = subCourse.toObject();
                return rest;
                });
            return {
            ...course.toObject(), 
            courses: modifiedCourses 
            };
        });
    res.status(200).json({status:"SUCCESS",data:filteredCourses})
}))

// get grade 12 course with subject name

router.get('/api/grade12/:name_subject', AsyncWraper ( async ( req , res )=>{
    const subjectName = req.params["name_subject"]
    const grade12_courses = await Grade.find({grade:"grade12",subject:subjectName})
        const filteredCourses = grade12_courses.map(course => {
            const modifiedCourses = course.courses.map(subCourse => {
                const { video, ...rest } = subCourse.toObject();
                return rest;
                });
            return {
            ...course.toObject(), 
            courses: modifiedCourses 
            };
        });
    res.status(200).json({status:"SUCCESS",data:filteredCourses})
}))

// buy course

router.get('/api/courses/:course_id', AsyncWraper ( async ( req , res )=>{
    const token = req.headers['token']
    const courseId = req.params['course_id']
    const course = await Grade.findOne({_id:courseId},{price:true , discount:true , mini_price:true ,  users:true })
    const user = await User.findOne({token},{wallet:true,courses:true,_id:true})
    const courses = user.courses;
    const users_courses = [...course.users]
    let check = false
if(user){
    if(course){
        for(i=0 ; i < courses.length ; i++){
            if(courses[i].id == courseId){
            check = true
            }
        }
        if(!check){
            if(course.discount == 'true'){
                if(user.wallet >= course.mini_price){
                    const new_courses_discoun = [];
                    const object_disc = {};
                    object_disc.again = 3 ;
                    object_disc.id = courseId;
                    if(courses[0] == [][0]){
                        new_courses_discoun.push(object_disc)
                        users_courses.push(user._id) 
                        await User.updateOne({token},{wallet:user.wallet - course.mini_price,courses:new_courses_discoun })
                        await Grade.updateOne({_id:courseId},{users:users_courses})
                    }else{
                        new_courses_discoun.push(...courses) 
                        new_courses_discoun.push(object_disc) 
                        users_courses.push(user._id) 
                        await User.updateOne({token},{wallet:user[0].wallet - course.mini_price,courses:new_courses_discoun })
                        await Grade.updateOne({_id:courseId},{users:users_courses})
                    }
                    res.status(200).json({status:"SUCCESS",data:[]})
                }else{
                    res.status(404).json({status:"FAIL",data:[],msg:"you dont have enough money"})
                }
            }
            else{
                if(user.wallet >= course.price){
                    const new_courses = [];
                    const object = {};
                    object.again = 3;
                    object.id = courseId;
                    
                    if(courses[0] == [][0]){
                    new_courses.push(object)
                    users_courses.push(user._id) 
                    await User.updateOne({token},{wallet:user.wallet - course.price,courses:new_courses})
                    await Grade.updateOne({_id:courseId},{users:users_courses})
                    }else{
                        new_courses.push(...courses) 
                        new_courses.push(object)
                        users_courses.push(user._id) 
                        await User.updateOne({token},{wallet:user.wallet - course.price,courses:new_courses})
                        await Grade.updateOne({_id:courseId},{users:users_courses})
                    }    
                    res.status(200).json({status:"SUCCESS",data:[]})
                }else{
                    res.status(404).json({status:"FAIL",data:[],msg:"you dont have enough money"})
                }
            }
                
        }else{
            res.status(404).json({status:"FAIL",data:[],msg:"you have this course already"})
        }
    }else{
        res.status(404).json({status:"FAIL",data:[],msg:"this course is not existed"})
    }
}else{
    res.status(404).json({status:"FAIL",data:[],msg:"you dont have account"})
}
}))

// الدخول للكورس
router.get('/api/:course_id' , AsyncWraper ( async (req ,res)=>{
    const course_id = req.params['course_id']
    const token = req.headers['token']
    jwt.verify(token,process.env.JWT_SECRET_KEY, async ( err , decoded ) =>{
        if(!err){
            const find_user = await User.findOne({token},{ courses:true , subscription:true })
            const find_course = await Grade.findOne({_id:"66a4054d66641fa76f2e8acd"},{grade:true})
            if(find_user){
                if(find_user.subscription[0] && find_user.subscription[0].name == find_course.grade){
                    const data_course = await Grade.find({_id:course_id})
                    res.status(200).json({status:"SUCCESS",data:data_course})
                }else{
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
                        const grade = await Grade.findOne({_id:course_id},{watched:true})
                        await Grade.updateOne({_id:course_id},{watched:grade.watched + 1})
                        res.status(200).json({status:"SUCCESS",data:data_course})
                    }else{
                    res.status(404).json({status:"FAIL",data:[],msg:"اشتري الكورس الأول"})
                    }
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

// subscription year
router.get('/api/subscription/:courseId' , AsyncWraper( async ( req , res ) => {
const token = req.headers['token']
const courseId = req.params['courseId']
const price = 300
    jwt.verify(token , process.env.JWT_SECRET_KEY,async( err , decoded ) => {
        if(!err){
            const user = await User.findOne({token},{wallet : true , subscription : true})
            if(user.subscription.length === 0){
                if(user.wallet >= price){
                    await user.subscription.push({
                        name:courseId,
                        purchaseDate : new Date()
                    })
                    await User.findOneAndUpdate({token},{wallet : user.wallet - price})
                    user.save();
                    res.status(200).json({status:"SUCCESS",data:[],})
                }else{
                    res.status(404).json({status:"FAIl",data:[],msg:"you dont have enough money"})
                }
            }
            else{
                res.status(404).json({status:"FAIL",data:[],msg:"you have already subscription"})
            }
        }
        else{
            res.status(404).json({status:"ERROR",data:[],msg:'unvalidation token'})
        }
    })
}))

// 
module.exports = router

