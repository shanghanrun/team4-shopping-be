const User = require('../model/User')
const authController ={}
const jwt = require('jsonwebtoken')
require('dotenv').config()
const secretKey = process.env.JWT_SECRET_KEY


// api요청으로부터 토큰값 받아서 user정보 인증 -> req.userId 건내기
authController.authenticate=async(req, res, next)=>{
	try{
		const tokenString = req.headers.authorization
		if(!tokenString){
			throw new Error('no token')
		}
		const token = tokenString.replace('Bearer ', '')
		jwt.verify(token, secretKey, (err, payload)=>{
			if(err){
				throw new Error('invalid token')
			}
			req.userId = payload._id  //다음 req에 userId 실어넘김
		})
		// console.log('토큰 검증되었습니다.')
		next()
	}catch(e){
		return res.status(400).json({status:'fail', error:e.message})
	}
}

// req.userId를 받고서 admin 여부를 검증하기 -> 가지고 있던 req.userId는 아무것도 안하면 그대로 있기에 다음 controller로 저절로 넘어간다.
authController.checkAdminPermission=async(req,res,next)=>{
	try{
		const userId = req.userId
		const user = await User.findById(userId)
		if(user.level !=='admin') throw new Error('no permission')
		next()
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}

authController.verifyToken =async(req, res)=>{
	const token = req.query.token;
	console.log('영화페이지로부터 받은 토큰', token)
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Assuming the token contains id, name, and email
    const { id, name, email } = decoded;
    res.json({ id, name, email });
  });
}

module.exports = authController;