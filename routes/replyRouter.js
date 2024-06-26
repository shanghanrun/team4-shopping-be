const express = require('express')
const replyController = require('../controllers/replyController')
const authController = require('../controllers/authController')
const replyRouter = express.Router()


replyRouter.post('/', authController.authenticate, replyController.createReply) // {reviewId, inquiryId, content}

replyRouter.put('/:id', authController.authenticate,replyController.updateReply) // replyId, {content}
replyRouter.delete('/:id', authController.authenticate,replyController.deleteReply) // replyId

module.exports = replyRouter;