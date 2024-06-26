const Reply = require('../model/Reply')
const Review = require('../model/Review')
const User = require('../model/User')
const replyController={}

replyController.createReply = async (req, res)=>{
	try{
		const {reviewId, inquiryId, content} = req.body;  //bodyParser가 알아서 읽어 준다. 사실 클라이엔트에서 isDone:false로 자료 넘겨주어야 된다.
		const userId = req.userId
		// console.log('reviewId :', reviewId)
		// console.log('content :', content)
		// console.log('userId :', userId)
		const foundUser = await User.findById(userId)
		const foundUsername = foundUser.name
		console.log('foundUser, foundUsername:', foundUser, ':',foundUsername)
		const newReply = new Reply({content, authorId: userId, author:foundUsername})
		await newReply.save()

		console.log('새 reply 저장됨:', newReply)

		// Review를 찾아서, replies 배열에 새로운 replyId 추가
		if(reviewId){
			await Review.updateOne(
				{ _id: reviewId },
				{ $push: { replyIds: newReply._id }}
			);
		}
		// inquiry에 답변한 경우
		if(inquiryId){
			await inquiry.updateOne(
				{ _id: inquiryId },
				{ $push: { replyIds: newReply._id }}
			);
		}

		res.status(200).json({status:'ok', data: ''})
	} catch(e){
		res.status(400).json({status:'fail', error:e})
	}
} 


replyController.updateReply = async(req, res)=>{
	try{
		const id = req.params.id;  //replyId
		const {content} = req.body;

		const foundReply = await Reply.findById(id)
		console.log('찾은 리플라이 :', foundReply)

		await Reply.updateOne(
			{_id: id},
			{ $set: {content: content}},
		)
		res.status(200).json({status:'ok',data:''})
	}catch(e){
		res.status(400).json({status:'fail', error:e})
	}
}
replyController.deleteReply = async(req, res)=>{
	try{
		const {id} = req.params;
		await Reply.deleteOne({_id: id})
		//혹은  await Reply.findByIdAndDelete(id);
		res.status(200).json({status:'ok',data:''})
	}catch(e){
		res.status(400).json({status:'fail', error:e})
	}
}

module.exports = replyController