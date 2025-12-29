const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const indexRouter = require('./routes/index')

const app = express()

require('dotenv').config()
// const corsOptions = {
//     origin: 'https://prismatic-yeot-27799a.netlify.app',
// };
// app.use(cors(corsOptions));

// app.use(cors({
//   origin: [
// 	'https://prismatic-yeot-27799a.netlify.app', 
// 	'https://prismatic-yeot-27799a.netlify.app/api', 
// 	'https://prismatic-yeot-27799a.netlify.app/api/product', 
// 	'http://localhost:3000'
// ],
//   optionsSuccessStatus: 200
// }));
const allowedOrigins =[
	'https://team4-shopping-fe.vercel.app',
	'http://localhost:3000'
]

app.use(cors({
	origin: function(origin, callback){
		if(!origin || allowedOrigins.indexOf(origin) !== -1){
			callback(null, true);
		} else{
			callback(new Error('Not allowed by CORS'))
		}
	},
	credentials: true
}))

app.use(bodyParser.urlencoded({extended:false})) //url 인식
app.use(bodyParser.json()) // req.body가 객체로 인식이 된다.
app.use('/api', indexRouter)

// const mongoURI = process.env.LOCAL_DB
const mongoURI = process.env.CLOUD_DB
mongoose.connect(mongoURI)
	.then(()=>console.log('mongoose connected'))
	.catch((e)=>console.log("DB connection fail", e.message))

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {   //localhost:3000 대신 0.0.0.0:3000으로 리슨하도록 변경
  console.log(`Server is running on port ${PORT}`);
});


// const connectDB = async () => {  //만약 몽고디비 에러날 경우 대비 코드
//   try {
//     await mongoose.connect(mongoURI);
//     console.log('mongoose connected !');
//     app.listen(process.env.PORT || 5000, () => {
//       console.log('server on');
//     });
//   } catch (err) {
//     console.log('db connection fail', err);
//     process.exit(1);
//   }
// };
// connectDB();



// app.listen(process.env.PORT || 5001, ()=>{   // 로컬로 할 때 이걸로
// 	console.log('Server is on 5001')
// })
