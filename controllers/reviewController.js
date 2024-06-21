const Review = require('../model/Review')
const Product = require('../model/Product')
const User = require('../model/User')
const mongoose =require('mongoose')

const reviewController={}


reviewController.createReview=async(req, res)=>{
	try{
		const {author, authorId, productId, title,image,content,star} = req.body;
		console.log('받은 author', author)
		console.log('받은 authorId', authorId)
		console.log('받은 title', title)

		// Validation
        if (!title || !content || star == null) {
            return res.status(400).json({ status: 'fail', message: 'title, content, and star are required.' });
        }
		
		const review = new Review({
			authorId, author, productId, title,image,content,star
		})
		await review.save()
		
		console.log('작성된 review:', review)
		// user에게도 해당 리뷰id를, 리뷰ids 목록에 추가
		const user = await User.findById(authorId)
		if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found.' });
        }
		user.reviewIds.push(review._id)
		await user.save()
		console.log('user.reviewedIds에 review._id 추가함')

		return res.status(200).json({status:'success',data: review})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}
reviewController.getAllReviewList=async(req, res)=>{
	try{
		const allReviews = await Review.find({isDeleted:false}).populate('authorId', '_id name email image').populate('productId', '_id name image price')
		return res.status(200).json({status:'success',data:allReviews})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}
reviewController.getMyReviewList=async(req, res)=>{
	try{
		const userId = req.userId
		const myReviews = await Review.find({
				userId, 
				isDeleted:false
		}).populate('authorId', '_id name email image').populate('productId', '_id name image price')
		return res.status(200).json({status:'success',data:myReviews})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}
reviewController.getItemReviewList=async(req, res)=>{
	try{
		console.log('getItemReviewList 시작')
		const productId = req.params.id
		const itemReviews = await Review.find({
			    // 해당 아이템에 대해 리뷰가 여러개일 수 있다.
				productId: new mongoose.Types.ObjectId(productId), 
				// isDeleted:false
		}).populate('authorId', '_id name email image').populate('productId', '_id name image price')

		console.log('찾은 reviewItemList :', itemReviews)
		return res.status(200).json({status:'success',data: itemReviews})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}
reviewController.updateReview=async(req, res)=>{
	try{
		const {reviewId, title,image,content,star} =req.body
		const updatedReview = await Review.findByIdAndUpdate(
			reviewId,
			{title, image, content, star},
			{new: true}
		)

		return res.status(200).json({status:'success',data: updatedReview})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}
reviewController.deleteReview=async(req, res)=>{
	try{
		const reviewId = req.params.id
		const review = await Review.findByIdAndUpdate(
			reviewId,
			{isDeleted:true},
			{new: true}
		)
		if(!review) throw new Error('No review found')
		return res.status(200).json({status:'success',message:'A review deleted successfully'})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}



module.exports = reviewController;
