const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const indexRouter = require('./routes/index')

const app = express()

require('dotenv').config()
app.use(cors())
app.use(bodyParser.urlencoded({extended:false})) //url 인식
app.use(bodyParser.json()) // req.body가 객체로 인식이 된다.
app.use('/api', indexRouter)

// const mongoURI = process.env.LOCAL_DB
const mongoURI = process.env.CLOUD_DB
mongoose.connect(mongoURI)
	.then(()=>console.log('mongoose connected'))
	.catch((e)=>console.log("DB connection fail", e.message))

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, '0.0.0.0', () => {   //localhost:3000 대신 0.0.0.0:3000으로 리슨하도록 변경
//   console.log(`Server is running on port ${PORT}`);
// });
app.listen(process.env.PORT || 5001, ()=>{   // 로컬로 할 때 이걸로
	console.log('Server is on 5001')
})