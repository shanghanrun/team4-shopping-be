const Reply = require('../model/Reply')
const Review = require('../model/Review')
const Inquiry = require('../model/Inquiry')
const User = require('../model/User')
const replyController={}

replyController.createReply = async (req, res)=>{
	try{
		const {reviewId, inquiryId, content} = req.body;  //bodyParser가 알아서 읽어 준다. 사실 클라이엔트에서 isDone:false로 자료 넘겨주어야 된다.
		const userId = req.userId
		const foundUser = await User.findById(userId)
		const foundUsername = foundUser.name
		console.log('foundUser, foundUsername:', foundUser, ':',foundUsername)
		const newReply = new Reply({content, authorId: userId, author:foundUsername})
		await newReply.save()

		console.log('새 reply 저장됨:', newReply)

		// user에도 replyIds 배열에 replyId추가
		foundUser.replyIds.push(newReply._id)
		await foundUser.save()    // save는 안되고 save() 실행해야 됨.
		console.log('foundUser 변화:',foundUser)
		// Review를 찾아서, replies 배열에 새로운 replyId 추가
		if(reviewId){
			await Review.updateOne(
				{ _id: reviewId },
				{ 
					$push: { replyIds: newReply._id },
					$set: { status: 'gotReply'}
				}
			);
		}
		// inquiry에 답변한 경우
		if(inquiryId){
			await Inquiry.updateOne(
				{ _id: inquiryId },
				{ 
					$push: { replyIds: newReply._id },
					$set: {status: 'gotReply'}
				},
			);
		}
		console.log('inquiry 변화됨. 직접 살펴볼것')

		res.status(200).json({status:'ok', data:newReply})
	} catch(e){
		res.status(400).json({status:'fail', error:e})
	}
} 
//getReplyList가 없는 이유는 reply는 원래글에 따라서 다니기 때문이다.

replyController.updateReply = async(req, res)=>{
	try{
		const id = req.params.id;  //replyId
		const {content} = req.body;

		const foundReply = await Reply.findById(id)
		console.log('찾은 리플라이 :', foundReply)

		await Reply.updateOne(
			{_id: id},
			{ 
				$set: {
					content: content,
					status:'getReply'//사실 이미해서 안해도 된다.
				}
			},
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