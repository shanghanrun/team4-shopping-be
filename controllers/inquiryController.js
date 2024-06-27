const Inquiry = require('../model/Inquiry')
const User = require('../model/User')
const mongoose =require('mongoose')

const inquiryController={}


inquiryController.createInquiry=async(req, res)=>{
	try{
		const {author, authorId, title,image,content} = req.body;

		// Validation
        if (!title || !content) {
            return res.status(400).json({ status: 'fail', message: 'title and content are required.' });
        }
		
		const inquiry = new Inquiry({
			authorId, author, title,image,content
		})
		await inquiry.save()
		
		console.log('작성된 inquiry:', inquiry)
		// user에게도 해당 리뷰id를, 리뷰ids 목록에 추가
		const user = await User.findById(authorId)
		if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found.' });
        }
		user.inquiryIds.push(inquiry._id)
		await user.save()
		console.log('user.inquiryIds에 inquiry._id 추가함')

		return res.status(200).json({status:'success',data: inquiry})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}
inquiryController.getInquiryList=async(req, res)=>{
	try{
		console.log('getInquiryList 호출됨')
		const allInquiries = await Inquiry.find({isDeleted:false}).populate('replyIds', '_id author authorId content')   
		console.log('allInquiries :', allInquiries)
		return res.status(200).json({status:'success',data:allInquiries})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}
inquiryController.getMyInquiryList=async(req, res)=>{
	try{
		const userId = req.userId
		const myInquiries = await Inquiry.find({
				userId, 
				isDeleted:false
		})
		return res.status(200).json({status:'success',data:myInquiries})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}

inquiryController.updateInquiry=async(req, res)=>{
	try{
		const {_id, title,image,content} =req.body
		const updatedInquiry = await Inquiry.findByIdAndUpdate(
			_id,
			{title, image, content},
			{new: true}
		)

		return res.status(200).json({status:'success',data: updatedInquiry})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}
inquiryController.deleteInquiry=async(req, res)=>{
	try{
		const inquiryId = req.params.id
		const inquiry = await Inquiry.findByIdAndUpdate(
			inquiryId,
			{isDeleted:true},
			{new: true}
		)
		if(!inquiry) throw new Error('No inquiry found')
		return res.status(200).json({status:'success',message:'A inquiry deleted successfully'})
	}catch(e){
		console.error(e); 
		return res.status(400).json({status:'fail', error:e.message})
	}
}



module.exports = inquiryController;
