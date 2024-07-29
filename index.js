require('dotenv').config();

const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const path = require('node:path');

const user_route = require('./routes/users.route');
const wallet_route = require('./routes/code.route')
const grade_route = require('./routes/grade.route');
const checkAuth = require('./middlewares/uploads.middleware');
const cron = require('node-cron');

// modules
const User = require('./models/users.model')


app.use(cors())
app.use(express.json())
mongoose.connect(process.env.URI)







app.use('/uploadsUsers',checkAuth,express.static(path.join(__dirname,'/uploadsUser')))
app.use('/uploadsCourses',express.static(path.join(__dirname,'/uploadsVideo')))

app.use(user_route)
app.use(wallet_route)
app.use(grade_route)


cron.schedule('* 0 * * *',async()=>{
    const oneYearago = new Date();
    oneYearago.setFullYear(oneYearago.getFullYear() + 1)
    const Users = await User.find({},{subscription:1})
    for(const user of Users){
        user.subscription = user.subscription.filter(item => item.purchaseDate > oneYearago)
        await user.save()
    }
})

app.listen(process.env.PORT,()=>{
    console.log('server is work')
})