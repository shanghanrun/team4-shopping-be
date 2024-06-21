const mongoose = require('mongoose')
const {Schema} = mongoose
const User = require('./User.js')

const replySchema = Schema(
	{
		content: {
			type:String,
			required: true,
		},
		authorId:{
			type:Schema.Types.ObjectId,
			required:true,
			ref:"User"
		},
		author:{
			type:String,
			required:true,
		}
	},
	{ timestamps: true}
)
replySchema.methods.toJSON = function(){
	const obj = this._doc
	delete obj.__v;
	return obj;
}

const Reply = mongoose.model("Reply", replySchema)

module.exports = Reply;
