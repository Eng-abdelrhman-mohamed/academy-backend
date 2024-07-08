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




app.use(cors())
app.use(express.json())
mongoose.connect(process.env.URI)







app.use('/uploadsUsers',checkAuth,express.static(path.join(__dirname,'/uploadsUser')))
app.use('/uploadsCourses',express.static(path.join(__dirname,'/uploadsVideo')))

app.use(user_route)
app.use(wallet_route)
app.use(grade_route)


app.listen(process.env.PORT,()=>{
    console.log('server is work')
})