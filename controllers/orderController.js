const Order = require('../model/Order')
const Product = require('../model/Product')
const User = require('../model/User')
const { randomStringGenerator } = require('../utils/randomStringGenerator')
const productController = require('./productController')
const cartController = require('./cartController')

const orderController={}
const PAGE_SIZE =5

orderController.createOrder = async(req, res)=>{
	try{
		const userId = req.userId
		const {shipTo, contact, totalPrice, salePrice,items} = req.body;

		console.log('shipTo, totalPrice', shipTo, totalPrice)
		console.log('items :', items)

		// 재고확인 & 재고 업데이트
		const insufficientStockItems = await productController.checkItemsStock(items)

		// 재고가 충분하지 않은 아이템이 있으면 -> 에러
		if(insufficientStockItems.length >0){
			const errorMessage = insufficientStockItems.reduce((total, item)=> total += `${item.message} \n;`, '')
			throw new Error(errorMessage)
		}
		const orderNum = randomStringGenerator()

		const user = await User.findById(userId)
		const email = user.email

		const newOrder = new Order({
			userId, email, shipTo, contact,totalPrice, salePrice, items,
			orderNum: orderNum,
		})
		await newOrder.save()
		console.log('Order 생성됨')
		//save후에 cart를 비워준다. 그런데 cart는 바로 비울 필요가 없다.
		//await cartController.emptyCart() 해서 바로 카트를 비우면 
		// 프론트엔드에서 getCart()하고, 화면구성할 때 에러가 나올 수 있다. 
		// cart비우는 것은, 프론트엔드에서 필요할 때 요청하게 만든다.

		//추가로 user에게도 orders에 orderNum을 건네고, purchaseItems에 order-products를 넘긴다.
		// user.shipTo에 주소를 리스트로 넣는데, 만약 이미 있는 주소라면 넣지 않는다.
		// user.totalPurchase에 totalPice를 더한다.
		user.orders.push(orderNum);
		console.log('오더생성하면서 user orders정보 업데이트')

		// Ensure purchasedItems is an object
		if (!user.purchasedItems || typeof user.purchasedItems !== 'object') {
		user.purchasedItems = {};
		}
		
		items.forEach(item =>{
			const productId = item.productId._id;
			const quantity = item.qty;

			if (user.purchasedItems[productId]){
				user.purchasedItems[productId] += quantity;
			} else{
				user.purchasedItems[productId] = quantity;
			}
		})

		console.log('user purchasedItems :', user.purchasedItems)
		
		// Ensure shipTo is an array
		if (!Array.isArray(user.shipTo)) {
			user.shipTo = [];
		}

		// const addressList = [...user.shipTo]
		// if(addressList.length >0){
		// 	addressList.forEach(address => {
		// 		if (address !== shipTo){
		// 			addressList.push(shipTo)
		// 		}
		// 	})
		// } else{
		// 	addressList.push(shipTo)
		// }
		// Check if the address already exists in the array
		// 아래가 더 좋은 방법이다.
		if (!user.shipTo.includes(shipTo)) {
			user.shipTo.push(shipTo);
		}

		console.log('user shipTo :', user.shipTo)

		const defaultTotalPurchase = user.totalPurchase
		user.totalPurchase = defaultTotalPurchase + totalPrice

		console.log('user totalPurchase :', user.totalPurchase)
		await user.save()
		console.log('user의 orders, purchasedItems 정보가 업데이트 되었습니다.')
		

		return res.status(200).json({status:'ok', orderNum: orderNum})
	}catch(e){
		return res.status(400).json({status:'fail', error:e.message})
	}
}


orderController.getOrderList=async(req, res)=>{
	const PAGE_SIZE = 10
	try{
		const {page, orderNum} = req.query
		const userId =  req.userId
		// console.log('다음 유저의 orderList검색: ', userId)

		let cond ={isDeleted:false}  // condition 객체, 삭제 안된 order들
		if (userId.level !== 'admin'){
			cond = { userId: userId };
		}

		if (orderNum) {  //주문번호의 일부만 있어도 검색가능
			cond.orderNum = { $regex: orderNum, $options: 'i' };
		}
		// const cond = orderNum? {
		// 	orderNum:{$regex: orderNum, $options:'i'}
		// 	} 
		// 	:{}
		// console.log('cond : ', cond)
		// console.log('백엔드 page', page)

		let query = Order.find(cond)
		let response = {status:'success'}

		//이부분을 if(page) 바깥으로 뺐다.
		const totalItemNum = await Order.find(cond).countDocuments()
		const totalPages = Math.ceil(totalItemNum / PAGE_SIZE)
			response.totalPageNum = totalPages
		//
		
		if(page){
			query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE)
		}

		const orderList = await query.exec()
		response.orderList = orderList
		// console.log('찾은 orderList', orderList)

		res.status(200).json(response)
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
orderController.getAllUserOrderList=async(req, res)=>{
	const PAGE_SIZE = 10
	try{
		const {page, orderNum} = req.query
		// const userId =  req.userId  // admin이 검색하는 거라, 누구의 order인지 구별필요없다.
		// console.log('다음 orderNum 검색: ', orderNum)

		let cond ={isDeleted:false}  // condition 객체
		// if (userId.level !== 'admin'){
		// 	cond = { userId: userId };
		// }
		if (orderNum) {
			cond.orderNum = { $regex: orderNum, $options: 'i' };
		}

		let query = Order.find(cond)
		let response = {status:'success'}

		if(page){
			query.skip((page-1)*PAGE_SIZE).limit(PAGE_SIZE)
			const totalItemNum = await Order.find(cond).countDocuments()
			const totalPages = Math.ceil(totalItemNum / PAGE_SIZE)
			response.totalPageNum = totalPages
		}

		const orderList = await query.exec()
		const totalCount = await Order.find().countDocuments()
		response.data = orderList
		response.totalCount = totalCount
		// console.log('찾은 orderList', orderList)

		res.status(200).json(response)
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}

orderController.updateOrder = async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId }, // 검색 조건
            { status: newStatus }, // 수정 내용
            { new: true } // 수정된 문서를 반환하도록 설정
        );
		// console.log('업데이트된 order :', updatedOrder)
        if (!updatedOrder) {
            throw new Error("주문을 찾을 수 없습니다.")
        }
        // 수정된 주문을 클라이언트로 응답
        res.status(200).json({status:'ok', updatedOrder: updatedOrder});
    } catch (error) {
        console.log("주문 업데이트 오류:", error);
        res.status(500).json({ status:'fail', error: "주문을 업데이트하는 동안 오류가 발생했습니다." });
    }
};

orderController.deleteOrder = async(req, res)=>{
	try{
		const orderId = req.params.id
		const updatedOrder = await Order.findByIdAndUpdate(
			{_id:orderId},
			{isDeleted: true},
			{new: true}
		)
		// console.log('삭제된 order :', updatedOrder)
        if (!updatedOrder) {
            throw new Error("삭제 작업에 문제가 발생했습니다.")
        }
       
        res.status(200).json({status:'ok', message: '삭제성공!'});
	}catch(e){
        res.status(500).json({ status:'fail', error: e.message });
	}
}
orderController.getUserOrder=async(req,res)=>{
	//해당 id로 발견되지 않을 경우도 있다. 주문 안했으니
	try{
		// console.log('getUserOrder!!!==============')
		const userId = req.params.id
		// console.log('userId:', userId)
		const foundOrder = await Order.findOne({userId})
		// 검색해서 없으면 null 반환
		// console.log('foundOrder:',foundOrder)
		res.status(200).json({status:'ok', data: foundOrder})
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}

module.exports = orderController;