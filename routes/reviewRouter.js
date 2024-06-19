const express = require('express')
const reviewRouter = express.Router()
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')

// 새 리뷰 작성
reviewRouter.post('/', reviewController.createReview)

// admin이 모든 review를 열람해서 보여준다.
reviewRouter.get('/', authController.authenticate, authController.checkAdminPermission, reviewController.getAllReviewList)

// 유저가 자신이 작성한 review를 볼 수 있도록 한다.
reviewRouter.get('/my-review', authController.authenticate, reviewController.getMyReviewList)


// 해당 product에 대한 reviewList 가져오기
reviewRouter.get('/:id', reviewController.getItemReviewList)

// 유저가 자신이 작성한 review를 수정할 수 있도록 한다. 
reviewRouter.put('/', authController.authenticate, reviewController.updateReview)

// 유저가 자신이 작성한 review를 삭제할 수 있도록 한다.
reviewRouter.delete('/:id', authController.authenticate, reviewController.deleteReview)

module.exports =reviewRouter