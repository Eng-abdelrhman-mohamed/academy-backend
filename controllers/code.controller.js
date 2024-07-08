const User = require('../models/users.model.js');
const wallet_Schema = require('../models/code.model.js');
const asyncWrapper = require('express-async-wrap')
const xlsx = require('xlsx');
const fs = require('fs');


// create codes
const createCodes = asyncWrapper( async(req,res)=>{

    const { customAlphabet } = await import('nanoid');
    for(i = 0 ; i <= 10 ; i++){
       const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
       const nanoid = customAlphabet(alphabet, 9);
       const id = nanoid();
       const wallet = new wallet_Schema({
           code:id
       })
        await wallet.save()
     }
     const users = await wallet_Schema.find();
     const worksheet = xlsx.utils.json_to_sheet(users.map(user => user.toObject()));
     const workbook = xlsx.utils.book_new();
     xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
     const filePath = './data.xlsx';
     xlsx.writeFile(workbook, filePath)
       res.json({status:'good'})
})


// buy code
const buyCode = asyncWrapper( async(req,res)=>{
    const token = req.headers['token'];
    const code = req.headers['code']
    const findUser = await User.findOne({token},{password:false})
    const findCode = await wallet_Schema.findOne({code})
        if(findUser && findCode){
        await wallet_Schema.deleteOne({code})
        await User.updateOne({token},{wallet:(+findUser.wallet + 50)})
        res.status(200).json({status:"SUCCESS",data:[],msg:'you have bought code'})
        }
        else{
            return res.status(404).json({status:"FAIl",data:[],msg:'this is not defiend'})
        }
})

module.exports={
    createCodes,
    buyCode
}
