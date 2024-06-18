const mongoose =require('mongoose')
const Schema = mongoose.Schema
const reviewSchema = Schema({
	title: {type:String, required:true},
	image: {type:String},
	content: {type:String, default:""},
	star: {type:Number, default:0},
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