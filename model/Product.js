const mongoose =require('mongoose')
const Schema = mongoose.Schema
const productSchema = Schema({
	sku: {type:String, required:true, unique:true},
	name: {type:String, required:true},
	image: {type:String,required:true},
	price: {type:Number, default:0},
	salePrice: {type:Number, default:0},
	brand:{type:String, default:''},
	category:{type:Array, required:true},
	description:{type:String, default:''},
	stock:{type: Object, required:true},
	status:{type:String, default:'active'},
	isDeleted:{type:Boolean, default:false},
	soldCount:{type:Number, default:0},
	onePlus:{type:Boolean, default:false},
	salePercent:{type:Number, default:0},
	freeDelivery:{type:Boolean, default:false},
	kind:{type:String, default:'women'}
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