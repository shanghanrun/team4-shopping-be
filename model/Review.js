const mongoose =require('mongoose')
const Schema = mongoose.Schema
const User = require('./User')
const Product = require('./Product')

const reviewSchema = Schema({
	authorId:{type:mongoose.ObjectId, ref: 'User'},
	author:{type:String,required:true,},
	productId:{type:mongoose.ObjectId, ref:Product},
	title: {type:String, required:true},
	image: {type:String},
	content: {type:String, default:""},
	star: {type:Number, default:0},
	isDeleted:{type:Boolean, default:false},
	status:{type:String, default:'noReply'},
	replyIds:[
			{ type:mongoose.ObjectId,
				ref:"Reply"
			}
	]
},{timestamps:true})

reviewSchema.methods.toJSON =function(){
	const obj = this._doc
	delete obj.__v
	// delete obj.createdAt
	// delete obj.updatedAt
	return obj
}

const Review = mongoose.model("Review", reviewSchema)

module.exports = Review;