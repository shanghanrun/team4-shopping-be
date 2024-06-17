const mongoose =require('mongoose')
const Schema = mongoose.Schema
const productSchema = Schema({
	sku: {type:String, required:true, unique:true},
	name: {type:String, required:true},
	chosung:{type:Array, default:['']},
	image: {type:String,required:true},
	price: {type:Number, default:0},
	category:{type:Array, required:true},
	description:{type:String, default:''},
	stock:{type: Object, required:true},
	status:{type:String, default:'active'},
	isDeleted:{type:Boolean, default:false}
},{timestamps:true})

productSchema.methods.toJSON =function(){
	const obj = this._doc
	delete obj.__v
	// delete obj.createdAt
	// delete obj.updatedAt
	return obj
}

const Product = mongoose.model("Product", productSchema)

module.exports = Product;