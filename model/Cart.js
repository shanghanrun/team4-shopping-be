const mongoose =require('mongoose')
const User = require('./User')
const Product = require('./Product')

const Schema = mongoose.Schema
const cartSchema = Schema({
	userId:{type:mongoose.ObjectId, ref:User},//혹은 mongoose.ObjectId
	items:[{
		productId:{type:mongoose.ObjectId, ref:Product},
		name:{type: String, default:''},  //내가 추가한 것
		image:{type:String, default:''},
		price:{type: Number, default:0},
		size:{type:String, required:true},
		qty:{type:Number, default:1, required:true}
	}]
},{timestamps:true})

cartSchema.methods.toJSON =function(){
	const obj = this._doc
	delete obj.__v
	delete obj.createdAt
	delete obj.updatedAt
	return obj
}

const Cart = mongoose.model("Cart", cartSchema)

module.exports = Cart;