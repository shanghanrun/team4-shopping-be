const mongoose =require('mongoose')
const Schema = mongoose.Schema
const User = require('./User')

const inquirySchema = Schema({
	authorId:{type:mongoose.ObjectId, ref: 'User'},
	author:{type:String,required:true,},
	title: {type:String, required:true},
	image: {type:String, default:''},
	content: {type:String, default:""},
	isDeleted:{type:Boolean, default:false},
	replyIds:[
			{ type:mongoose.ObjectId,
				ref:"Reply"
			}
	]
},{timestamps:true})

inquirySchema.methods.toJSON =function(){
	const obj = this._doc
	delete obj.__v
	// delete obj.createdAt
	// delete obj.updatedAt
	return obj
}

const Inquiry = mongoose.model("Inquiry", inquirySchema)

module.exports = Inquiry;