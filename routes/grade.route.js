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

// feature buy course
router.get('/api/courses/:mounth_id/:course_id', AsyncWraper ( async ( req , res )=>{

    const token = req.headers['token'];
    const courseId = req.params["course_id"];
    const mounthId = req.params["mounth_id"];
    const mounth = await Grade.findOne({_id:mounthId})
    const user = await User.findOne({token},{subscription:true,wallet:true,courses:true,transactions:true})
    const courses_user = user.courses
    const course = [] 
    let check = false 
    jwt.verify(token,process.env.JWT_SECRET_KEY,async (err, decoded)=>{
        if(!err){
            if(mounth){
                mounth.courses.map((subcourse)=>{ if(subcourse._id == courseId) course.push(subcourse) })
                if(course.length > 0){
                    for(i=0 ; i < courses_user.length ; i++){
                        if(courses_user[i].id == courseId){
                        check = true
                        }
                    }
                    if(!check){
                        if(course[0].discount == true){
                            if(user.wallet >= course[0].mini_price){
                                const new_courses_discoun = [];
                                const object_disc = {};
                                object_disc.again = 3 ;
                                object_disc.id = courseId;
                                if(courses_user[0] == [][0]){
                                    new_courses_discoun.push(object_disc)
                                    await User.updateOne({token},{wallet:user.wallet - course[0].mini_price,courses:new_courses_discoun })
                                    await user.transactions.push({
                                        mode:false,
                                        title:course[0].title,
                                        money:- (+course[0].mini_price)
                                    })
                                    user.save()
                                }else{
                                    new_courses_discoun.push(...courses) 
                                    new_courses_discoun.push(object_disc) 
                                    await User.updateOne({token},{wallet:user.wallet - course[0].mini_price,courses:new_courses_discoun })
                                    await user.transactions.push({
                                        mode:false,
                                        title:course[0].title,
                                        money:- (+course[0].mini_price)
                                    })
                                        user.save()
                                }
                                res.status(200).json({status:"SUCCESS",data:[]})
                            }else{
                                res.status(404).json({status:"FAIL",data:[],msg:"you dont have enough money"})
                            }
                        }
                        else{
                            if(user.wallet >= course[0].price){
                                const new_courses = [];
                                const object = {};
                                object.again = 3;
                                object.id = courseId;
                                
                                if(courses_user[0] == [][0]){
                                new_courses.push(object)
                                await User.updateOne({token},{wallet:user.wallet - course[0].price,courses:new_courses})
                                await user.transactions.push({
                                    mode:false,
                                    title:course[0].title,
                                    money:- (+course[0].price)
                                })
                                user.save()
                                }else{
                                    new_courses.push(...courses_user) 
                                    new_courses.push(object)
                                    await User.updateOne({token},{wallet:user.wallet - course[0].price,courses:new_courses})
                                    await user.transactions.push({
                                        mode:false,
                                        title:course[0].title,
                                        money:- (+course[0].price)
                                    })
                                user.save()
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
                    res.status(404).json({status:"FAIL",data:[],msg:"this course is not exicted"})
                }
                
                }else{
                res.status(404).json({status:"FAIL",data:[],msg:"this mounth is not exicted"})
                }
        }else{
            res.status(404).json({status:"FAIL",msg:"Invalid token",data:[]})
        }
    })
})) 
// feature شراء الشهري 
router.get('/api/courses/:mounth_id',AsyncWraper( async ( req , res )=>{
    const token = req.headers['token'];
    const mounth_id = req.params['mounth_id'];
    const user = await User.findOne({ token } , {courses : true , mounths : true} )
    let check = false
    jwt.verify(token , process.env.JWT_SECRET_KEY , async(err,encoded)=>{
        if(!err){
            if(user.mounths.length > 0){
                user.mounths.map((mounth)=>{mounth.id_of_mounth == mounth_id && ( check  = true )})
                if(!check){
                    



                    await user.mounths.push({
                        id_of_mounth:mounth_id
                    })
                    user.save()










                }else{
                    res.status(404).json({status:"FAIL",data:[],msg:'you have this course already'})
                }
            }
            else{
                await user.mounths.push({
                    id_of_mounth:mounth_id
                })
                user.save()
            }
        }else{
            res.status(404).json({status:"FAIL",msg:"Invalid token",data:[]})
        }
    })
}))  
// feature الدخول للكورس
router.get('/api/:mounth_id/:course_id' , AsyncWraper ( async ( req , res )=>{
    const token = req.headers['token'];
    const mounthId = req.params['mounth_id'];
    const courseId = req.params['course_id'];
    jwt.verify(token,process.env.JWT_SECRET_KEY , async ( err , decoded )=>{
        if(!err){
            const find_user = await User.findOne({token},{ courses:true , subscription:true })
            const find_mounth = await Grade.findOne({_id:mounthId } , {courses :true} )
            let find_course;
            find_mounth.courses.map((course)=>{course._id == courseId &&( find_course = course)})
            if(find_course){
                if(find_user.subscription[0] && find_user.subscription[0].name == find_course.grade){
                    res.status(200).json({status:"SUCCESS",data:find_course})
                }else{
                    const courses = find_user.courses
                    let check = false;
                    let again ;
                    for(i = 0 ; i < courses.length ; i++){
                        if(courses[i].id == courseId){
                            check = true;
                            again = courses[i].again;
                        }
                    }
                    if(check && again > 0 ){
                        if(again != 1){
                            await User.updateOne({token,'courses.id':courseId},{ $set: { 'courses.$.again': (again - 1) } })
                        }else{
                            await User.updateOne({token},{ $pull: { courses: {id : courseId} } })
                        }
                        res.status(200).json({status:"SUCCESS",data:find_course})
                    }else{
                    res.status(404).json({status:"FAIL",data:[],msg:"اشتري الكورس الأول"})
                    }
                }
            }else{
                res.status(404).json({status:"FAIL",data:[] , msg:"this course not found"})
            }
        }
        else{
            res.status(404).json({status:"FAIL" , data:[] , msg: "invalid token" })
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


module.exports = router
 