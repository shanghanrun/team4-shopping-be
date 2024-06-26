const express = require('express')
const inquiryRouter = express.Router()
const inquiryController = require('../controllers/inquiryController')
const authController = require('../controllers/authController')

// 새 문의 작성
inquiryRouter.post('/', inquiryController.createInquiry)

// 모든 문의를 열람해서 보여준다.
inquiryRouter.get('/', inquiryController.getInquiryList)

// 유저가 자신이 작성한 문의를 볼 수 있도록 한다.
inquiryRouter.get('/my', authController.authenticate, inquiryController.getMyInquiryList)


// 유저가 자신이 작성한 문의를 수정할 수 있도록 한다. 
inquiryRouter.put('/', authController.authenticate, inquiryController.updateInquiry)

// 유저가 자신이 작성한 문의를 삭제할 수 있도록 한다.
inquiryRouter.delete('/:id', authController.authenticate, inquiryController.deleteInquiry)

module.exports =inquiryRouter