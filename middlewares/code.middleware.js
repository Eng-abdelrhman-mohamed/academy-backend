

const codemiddle = (req,res,next)=>{
    const auth = (req.headers['authorization']).split(' ')[1]
    if(auth == process.env.ADMIN){
    next()
    }
    else{
    return res.json({fail:'fail'})
    }
 }
 
module.exports = codemiddle