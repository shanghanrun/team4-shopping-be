const Product = require('../model/Product')
const mongoose = require('mongoose'); 
const path = require('path');
const fs = require('fs');

const PAGE_SIZE =5
const productController={}

productController.createProduct = async(req, res)=>{
	try{
		const {sku,name, image,category,description,stock,price,status,isDeleted,kind,brand,onePlus,salePercent,salePrice,freeDelivery} = req.body;

		console.log('salePrice :', salePrice)

		const newProduct = new Product({sku, name,image,category,description,stock,price,status,isDeleted,kind,brand,onePlus,salePercent,salePrice, freeDelivery})
		await newProduct.save()

		console.log("백엔드 생성 new Product :", newProduct)
		
		return res.status(200).json({status:'ok', data:newProduct})
	}catch(e){
		return res.status(400).json({status:'fail', error:e.message})
	}
}

productController.getProductList=async(req, res)=>{
	try{
		const {page, name}= req.query  // ?뒤의 쿼리값
		// const condition = name? { name:{$regex:name, $options:'i'}, isDeleted:false} : {isDeleted:false}

		const condition = name
		? {
				$or: [
					{ name: { $regex: name, $options: 'i' } },
					{ chosung: { $elemMatch: { $regex: name } } } // 초성리스트에서 

					// { chosung: { $regex: name } }
				],
				isDeleted: false
			}
		: { isDeleted: false };
		
		let query = Product.find(condition) //함수를 만들어둠.
		// query = Product.find(condition2)
		let response = {status:"success"}  // response 전용객체를 만듬

		if(page){  
		// 보통은 1이 들어온다. 그러나 프론트앤드에서 productAll페이지는
		// 모든 상품을 보여주기 위해 page null 값을 보낸다.
		// 그래서 page null이면 아래의 제약사항이 없으므로, 모든 리스트를 반환한다.
	
    		const limit = PAGE_SIZE; // 한 페이지에 보여줄 문서의 수
    		const skip = (page - 1) * PAGE_SIZE;
		
			query.skip(skip).limit(limit)
			//전체페이지(총페이지) = 전체 데이터 /PAGE_SIZE
			const totalItemNum = await Product.find(condition).countDocuments()
			const totalPages = Math.ceil(totalItemNum / PAGE_SIZE)
			response.totalPageNum = totalPages 
		}

		const productList = await query.exec() 
		const totalCount = await Product.find().countDocuments()
		response.data = productList,  //한 페이지에 보여주는 productList
		response.totalProductCount = totalCount    //한 페이지가 아닌, 모든 페이지에 걸친 products 갯수
		res.status(200).json(response)   
		// response객체로 들어가면 data: productList, totalPageNum:totalPages 가 되고
		// 프론트앤드에서는 resp.data.data, resp.data.totalPageNum 으로 받는다. 
		// console.log('찾은 productList:', productList)
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
productController.getProductById = async(req,res)=>{
	try{
		const id = req.params.id
		const foundProduct = await Product.find({_id:id})
		if(foundProduct){
			res.status(200).json({status:'ok', data:foundProduct})
		}
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}

productController.updateProduct =async(req,res)=>{
	try{
		console.log('## updateProduct 에서 ##')
		const id = req.params.id
		const {sku,name,image,kind,category,brand,description,stock,price,status,isDeleted,salePrice,onePlus, salePercent,freeDelivery} = req.body;
		console.log('## updateProduct 에서 ##')
		console.log("salePrice, onePlus, salePercent :", salePrice, onePlus, salePercent)
		const updatedProduct = await Product.findByIdAndUpdate(
			{_id:id},
			{ sku,name,image,kind,category,description,stock,price,status,isDeleted,salePrice,onePlus, salePercent,freeDelivery },
			{ new: true} //새로 업데이트한 데이터를 return해줌 (product값으로 넣어줌)
		)
		if(!updatedProduct) throw new Error("item doesn't exist")
		res.status(200).json({status:'ok', data: updatedProduct})
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}

productController.deleteProduct =async(req, res)=>{
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: id },
      { isDeleted: true },
	  { new: true} //이것 있어야 업데이트된 문서 반환. 없으면 기존 문서를 만환한다.
    );
    if (!product) throw new Error("No item found");
    res.status(200).json({ status: "success", message:'A item was deleted successfully' });
  } catch (e) {
    res.status(400).json({ status: "fail", error: e.message });
  }
};
// productController.deleteProduct = async(req,res)=>{
// 	try{
// 		const id = req.params.id
// 		const result = await Product.deleteOne({_id:id})
// 		if (result.deletedCount === 1) {
// 			res.status(200).json({ status: 'ok', message: 'Item deleted successfully' });
// 		} else {
// 			throw new Error("Item doesn't exist");
// 		}
// 	}catch(e){
// 		res.status(400).json({status:'fail', message:e.message})
// 	}
// }
productController.getProductById = async(req,res)=>{
	try{
		const id = req.params.id
		const foundProduct = await Product.findById(id)
		if (foundProduct) {
			res.status(200).json({ status: 'ok', data: foundProduct });
		} else {
			throw new Error("Item doesn't exist");
		}
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
productController.checkStock=async(item)=>{
	try{
		// 사려는 아이템 재고 정보 들고오기
		const product = await Product.findById(item.productId)
		// 사려는 아이템 qty, 재고 비교
		// 재고가 불충불하면 불충분 메시지와 함께 데이터 반환
		// 충분하다면, 재고에서 -qty. 성공
		if(product.stock[item.size] < item.qty){
			return {isVerify:false, message: `${product.name}의 ${item.size} 재고가 부족합니다. \n현재 ${product.stock[item.size]}개 재고가 있습니다.`}
		} else{
			return {isVerify: true}
		}
	} catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}

productController.processStock=async(item)=>{
	try{
		const product = await Product.findById(item.productId)
		const newStock = {...product.stock}
		newStock[item.size] -= item.qty
		product.stock = newStock
		await product.save()
	} catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
productController.checkItemsStock= async (items)=>{
	const insufficientStockItems =[]
	try{
		await Promise.all(
			items.map(async(item)=>{
				const stockCheck = await productController.checkStock(item)
				if(!stockCheck.isVerify){
					insufficientStockItems.push({item, message:stockCheck.message})
				} 
			})
		)
		if (insufficientStockItems.length === 0) {
			await Promise.all(
				items.map(async(item)=>{
					await productController.processStock(item)
				})
			)
		}
		return insufficientStockItems;
	} catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}


productController.getLowStockProducts = async (req, res) => {
	try {
		const sizes = ['xs', 's', 'm', 'l', 'xl'];
		const condition = {
		isDeleted: false,
		$or: sizes.map(size => ({ [`stock.${size}`]: { $lte: 5 } }))
		};

		const productList = await Product.find(condition).exec();
		const totalCount = await Product.find(condition).countDocuments();

		const response = {
		status: "success",
		data: productList,
		totalProductCount: totalCount
		};

		res.status(200).json(response);
	} catch (e) {
		res.status(400).json({ status: 'fail', error: e.message });
	}
};


productController.cloudProduct2Json=async(req, res)=>{
	try{
		const products = await Product.find().lean() //lean() 몽구스 객체를 자바스크립트 객체로 변환
		const jsonFilePath = path.join(__dirname, 'products.json'); //__dirname현재디렉토리

		// JSON 파일로 저장
		fs.writeFileSync(jsonFilePath, JSON.stringify(products, null, 2));
		console.log('JSON file was written successfully');
		res.status(200).json({message:'몽고클라우드 디비로부터 json파일로 잘 저장되었습니다.'})
	}catch(e){
		res.status(400).json({ status: 'fail', error: e.message });
	}
}

productController.jsonProduct2Cloud=async(req,res)=>{
	try{
		const jsonFilePath = path.join(__dirname, 'products.json'); // JSON 파일 경로

		// JSON 파일 읽기
		const data = fs.readFileSync(jsonFilePath, 'utf8');
		const products = JSON.parse(data);

		// 기존 데이터 제거 (선택 사항) 우선 클라우드 디비의 해당 컬렉션 비워둔다.
		await Product.deleteMany({});

		// JSON 데이터를 MongoDB에 저장
		await Product.insertMany(products);
		console.log('Data imported to MongoDB successfully');

		res.status(200).json({message:'Data imported to MongoDB successfully.'});
	}catch(e){
		res.status(400).json({ status: 'fail', error: e.message });
	}
}

productController.getViewedList=async(req,res)=>{
	try{
		const userId = req.userId
		const {viewedIds} = req.body; //productId 들
		let foundProductList =[]
		
		for (const productId of viewedIds) {
			const objectId = new mongoose.Types.ObjectId(productId); // 문자열을 ObjectId로 변환
			const foundProduct = await Product.findById(objectId);
			foundProductList.push(foundProduct);
		}

		// 혹은 map과 Promise.all을 사용하는 것도 좋다.
		// map을 사용하여 비동기 작업을 병렬로 실행
		// const foundProductList = await Promise.all(viewedIds.map(async (productId) => {
		// const objectId = mongoose.Types.ObjectId(productId); // 문자열을 ObjectId로 변환
		// const foundProduct = await Product.findById(objectId);
		// return foundProduct;
		// }));
		
		res.status(200).json({status:'ok', data:foundProductList})
	}catch(e){
		res.status(400).json({ status: 'fail', error: e.message });
	}
}

productController.getOftenBuyList=async(req,res)=>{
	try{
		const {objectIds} = req.body
		// 문자열 ID를 ObjectId 형식으로 변환
    	const objectIdArray = objectIds.map(id => new mongoose.Types.ObjectId(id));

		// MongoDB에서 ObjectId 배열에 해당하는 제품 정보 가져오기
		const products = await Product.find({
			_id: { $in: objectIdArray }
		});

    	res.status(200).json({ data: products });
	}catch(e){
		res.status(400).json({ status: 'fail', error: e.message });
	}
}


module.exports = productController;