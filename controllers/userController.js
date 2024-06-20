const userController={}
const User = require('../model/User')
const bcrypt = require('bcryptjs')
const saltRounds =10
const {OAuth2Client} = require('google-auth-library')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const secretKey = process.env.JWT_SECRET_KEY

userController.createUser=async(req, res)=>{
	try{
		const {email, password, name, level} = req.body;
		const user = await User.findOne({email})
		if(user){
			throw new Error('이미 가입된 유저입니다.')
		}

		const hash = bcrypt.hashSync(password, saltRounds)
		const newUser = new User({email,password:hash, name, level:level? level : 'customer'})
		await newUser.save()

		return res.status(200).json({status:'success',message:'회원가입 성공'})
	}catch(e){
		return res.status(400).json({status:'fail', error:e.message})
	}
}
userController.createNewUser=async(req, res)=>{
	try{
		const {name, email, level,memo,image} = req.body;
		const user = await User.findOne({email})
		if(user){
			throw new Error('이미 가입된 유저입니다.')
		}
		const password ='123456' //직접만든 user에게 부여되는 패스워드

		const hash = bcrypt.hashSync(password, saltRounds)
		const newUser = new User({email,password:hash, name, level,memo,image})
		await newUser.save()

		return res.status(200).json({status:'success', data: newUser})
	}catch(e){
		return res.status(400).json({status:'fail', error:e.message})
	}
}

userController.loginWithEmail= async(req, res)=>{
	try{
		const {email,password} = req.body;
		const user = await User.findOne({email})
		// console.log('찾은 유저 정보 :', user )
		if(!user){
			// 가입한 상태가 아니라는 메시지, 로그인페이지로 리디렉션
			throw new Error('가입한 상태가 아닙니다. email을 다시 확인해 주세요')
		} else{
			// console.log('secretKey:', secretKey)
			const isMatch = bcrypt.compareSync(password, user.password);  //user.password는 암호화된 것
			if(!isMatch){
				throw new Error('패스워드가 일치하지 않습니다.')
				// 프론트앤드에서는 status400이면 로그인다시하도록
			} else{
				//1. 토큰 생성 2. 유저정보와 토큰을 보냄 3.홈페이지로 이동 
				const token =await user.generateToken()
				console.log('로그인 성공')
				return res.status(200).json({status:'success', user, token})
			}
		}
	}catch(e){
		return res.status(409).json({status:'fail', error:e.message})
	}
}

userController.loginWithGoogle= async(req, res)=>{
	try{
		//토큰값을 읽어온다.
		const {token} = req.body
		const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)
		const tokenInfo = await googleClient.verifyIdToken({
			idToken: token,
			audience: GOOGLE_CLIENT_ID
		})
		const {email, name} = tokenInfo.getPayload()
		let user = await User.findOne({email})
		console.log('찾은 email: name = ', email, ' : ', name)
		console.log('찾은 유저 정보 :', user )
		if(!user){ 
			// user를 생성한다.
			const randomPassword = ''+Math.floor(Math.random()*100000) //문자열로 만들기
			const hash = bcrypt.hashSync(randomPassword, saltRounds)
			user = new User({email,password: hash, name})
			await user.save() 	
			console.log('생성된 user정보 :', user)
		} 

		// 기존 user가 있던가, 없을 경우 새로 만든 user가 생성되면, 토큰을 발행하고 리턴
		const sessionToken = await user.generateToken()
		res.status(200).json({status:'success', user, token:sessionToken})
	}catch(e){
		return res.status(409).json({status:'fail', error:e.message})
	}
}

userController.getUser=async(req, res)=>{
	try{
		const userId = req.userId
		const user = await User.findById(userId)
		if(!user){
			throw new Error('can not find user')
		}
		res.status(200).json({status:'success', user })
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
userController.getUserList=async(req,res)=>{
	try{
		const {name} = req.query;
		const condition = name? {name:{$regex:name, $options:'i'}}
		: {}
		
		let query = User.find(condition)

		const users = await query.exec()
		res.status(200).json({status:'ok', data: users})
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
userController.updateUser=async(req,res)=>{
	try{
		const {userId, level,memo,image} = req.body;
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{level, memo,image},
			{new: true}
		)
		if(!updatedUser) throw new Error("user doesn't exist")
		res.status(200).json({status:'ok', data: updatedUser})
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
userController.updateCreditCoupon=async(req,res)=>{
	try{
		const {userId, credit, coupon, creditPlus} = req.body;
		console.log('userId, credit, coupon, creditPlus:', userId, ':',credit,':',coupon, ':',creditPlus)
		const updatedUser = await User.findByIdAndUpdate(
			userId, // 이렇게도 가능하다.
			{credit: credit + creditPlus, coupon},
			{new:true}
		)
		if(!updatedUser) throw new Error("user doesn't exist")
			res.status(200).json({status:'ok',data:updatedUser})
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}

userController.updateUserViewed=async(req,res)=>{
	try{
		const userId = req.userId
		const {productId} = req.body
		const user = await User.findById(userId)

		if(!user){
			return res.status(404).json({ status: 'fail', message: 'User not found' });
		}

		// Check if the productId is already in the viewedIds array
		const viewedIds = user.viewedIds;
		const productIdIndex = viewedIds.indexOf(productId);

		if (productIdIndex === -1) {
			// 없을 경우 추가
			viewedIds.push(productId);
		} 

		user.viewedIds = viewedIds;
		await user.save();

		return res.status(200).json({ status: 'success', data: user });
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}

module.exports = userController;
