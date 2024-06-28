const userController={}
const User = require('../model/User')
const Product = require('../model/Product')
const bcrypt = require('bcryptjs')
const saltRounds =10
const {OAuth2Client} = require('google-auth-library')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const secretKey = process.env.JWT_SECRET_KEY
const mongoose = require('mongoose'); 
const path = require('path');
const fs = require('fs');

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
		// console.log('userViewed 시작')
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
		// console.log('userViewedIds', user.viewedIds)
		await user.save();

		return res.status(200).json({ status: 'success', data: user });
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
userController.updateUserPassword = async(req,res)=>{
	try{
		const {userId, newPassword} = req.body;
		console.log('newPassword : ', newPassword)
		const user = await User.findById(userId)
			if(!user){
				throw new Error('유저를 찾는데 실패했습니다.')
			}
	
			const hash = bcrypt.hashSync(newPassword, saltRounds)
			user.password = hash
			await user.save()
	
			return res.status(200).json({status:'success', data: user})
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
userController.updateUserShipTo = async(req,res)=>{
	try{
		const {userId, selectedAddress} = req.body;
		const user = await User.findById(userId)
			if(!user){
				throw new Error('유저를 찾는데 실패했습니다.')
			}
			const list =[...user.shipTo]

			// 객체의 값 비교는 구체적으로 해야 된다.
			const addressAreEqual =(a, b)=>{
				return (
					a.address === b.address &&
					a.address2 === b.address2 &&
					a.city === b.city &&
					a.zip === b.zip &&
					a.contact === b.contact &&
					a.firstName === b.firstName &&
					a.lastName === b.lastName
				)
			}
			const tempList = list.filter((address)=> !addressAreEqual(address,selectedAddress)) //제거
			tempList.unshift(selectedAddress) // 맨 앞의 요소로 넣기
			user.shipTo = tempList
			await user.save()
	
			return res.status(200).json({status:'success', data: user})
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
userController.updateUserReplyChecked=async(req,res)=>{
	try{
		const userId = req.userId
		const user = await User.findById(userId)
		if(!user){
			return res.status(404).json({ status: 'fail', error: 'User not found' });
		}
		if(!user.replyChecked){
			user.replyChecked = false
		} else{  //reply를 변경할 때마다 user의 replyChecked를 반대로 만든다.
			user.replyChecked = !user.replyChecked
		}
		await user.save()
		
		res.status(200).json({ status: 'success', data:user });
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
userController.deleteUserViewed=async(req,res)=>{
	try{
		const userId = req.userId
		const productId = req.params.id
		const user = await User.findById(userId)
		const filteredList = user.viewedIds.filter((viewedId)=> viewedId !== productId)
		user.viewedIds = filteredList
		await user.save()

		//filteredList를 바탕으로 해당 product들 찾기
		const productList = await Promise.all(filteredList.map(async(itemId)=>{
			const productId = new mongoose.Types.ObjectId(itemId)
			const product = await Product.findById(productId)
			return product;
		}))

		console.log('user.viewedIds :', user.viewedIds)
		console.log('delete로 filter된 리스트:', filteredList)
		console.log('productList :', productList)


		res.status(200).json({status:'ok', data:productList})
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}

userController.cloudUser2Json=async(req, res)=>{
	try{
		const users = await User.find().lean() //lean() 몽구스 객체를 자바스크립트 객체로 변환
		const jsonFilePath = path.join(__dirname, 'users.json'); //__dirname현재디렉토리

		fs.writeFileSync(jsonFilePath, JSON.stringify(users, null, 2));
		console.log('JSON file was written successfully');
		res.status(200).json({message:'몽고클라우드 디비로부터 json파일로 잘 저장되었습니다.'})
	}catch(e){
		res.status(400).json({ status: 'fail', error: e.message });
	}
}

userController.jsonUser2Cloud=async(req,res)=>{
	try{
		const jsonFilePath = path.join(__dirname, 'users.json'); // JSON 파일 경로

		// JSON 파일 읽기
		const data = fs.readFileSync(jsonFilePath, 'utf8');
		const users = JSON.parse(data);

		// 기존 데이터 제거 (선택 사항) 우선 클라우드 디비의 해당 컬렉션 비워둔다.
		await User.deleteMany({});

		// JSON 데이터를 MongoDB에 저장
		await User.insertMany(users);
		console.log('Data imported to MongoDB successfully');

		res.status(200).json({message:'Data imported to MongoDB successfully.'});
	}catch(e){
		res.status(400).json({ status: 'fail', error: e.message });
	}
}



module.exports = userController;
