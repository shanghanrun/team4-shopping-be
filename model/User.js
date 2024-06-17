const mongoose =require('mongoose')
const Schema = mongoose.Schema
const jwt = require('jsonwebtoken')
require('dotenv').config()
const secretKey = process.env.JWT_SECRET_KEY


const userSchema = Schema({
	email:{type:String, required:true, unique:true},
	password:{type:String, required:true},
	name:{type:String, required:true},
	memo:{type:String, default:''},
	image:{type:String, default:''},
	level:{type:String, default:'customer'}, // customer, admin
	credit:{type:Number, default:10000}, //가입과 동시에 만원 넣어줌
	coupon:{type:Number, default:0}
},{timestamps:true})

userSchema.methods.toJSON =function(){
	const obj = this._doc
	delete obj.password
	delete obj.__v
	delete obj.createdAt
	delete obj.updatedAt
	return obj
}

userSchema.methods.generateToken = async function(){
	const token = await jwt.sign({_id:this._id}, secretKey,{expiresIn:"1d"})
	return token;
}

const User = mongoose.model("User", userSchema)

module.exports = User;