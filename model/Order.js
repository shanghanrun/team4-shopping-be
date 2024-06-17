const mongoose =require('mongoose')
const User = require('./User')
const Product = require('./Product')

const Schema = mongoose.Schema
const orderSchema = Schema({
	userId:{type:mongoose.ObjectId, ref:User},
	email:{type:String},
	status:{type:String, default:'preparing'},
	orderNum:{type:String},
	shipTo:{type: Object, required:true},
	contact:{type: Object, required:true},
	totalPrice:{type:Number, default:0},
	salePrice:{type:Number, default:0},
	isDeleted:{type:Boolean, default:'false'}, //이것도 삭제하지 않고 남겨둔다.
	items:[{
		productId:{type:mongoose.ObjectId, ref:Product},
		name:{type:String, default:''},
		image:{type:String, default:''},
		size:{type:String, required:true},
		sku:{type:String, required:true},
		qty:{type:Number, default:1, required:true},
		price:{type:Number, required:true}
	}]
},{timestamps:true})

orderSchema.methods.toJSON =function(){
	const obj = this._doc
	delete obj.__v
	delete obj.createdAt
	return obj
}

const Order = mongoose.model("Order", orderSchema)

module.exports = Order;