const User = require('../models/users.model')
const jwt = require('jsonwebtoken');
const path = require('node:path');

const checkAuth = async (req, res, next) => {
    const token = req.headers['token']
    jwt.verify( token , process.env.JWT_SECRET_KEY , async ( err , decoded )=>{
        if(!err){
            const user = await User.findOne({token},{avatar:true})
            const filePath = req.path;
            const fileName = path.basename(filePath);
            if(user.avatar === fileName){
                next()
            }
            else{
                return res.status(400).json({status:'FAIL',data:[],msg:"forbidden"})
            }
        }else{
            return res.status(400).json({status:'FAIL',data:[],msg:"forbidden"})
        }
    })

};

module.exports = checkAuth