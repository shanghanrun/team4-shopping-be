const mongoose =require('mongoose')
const Schema = mongoose.Schema
const movieSchema = Schema({
	title: {type:String, default:''},
	image: {type:String, default:''},
	seat: {type:String, default:''},
	userId:{type:mongoose.ObjectId, required:true},
	
},{timestamps:true})

movieSchema.methods.toJSON =function(){
	const obj = this._doc
	delete obj.__v
	// delete obj.createdAt
	// delete obj.updatedAt
	return obj
}

const Movie = mongoose.model("Movie", movieSchema)

module.exports = Movie;