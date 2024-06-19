const express = require('express')
const userRouter = express.Router()

const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

userRouter.post('/', userController.createUser) // post '/api/user'
userRouter.post('/new', userController.createNewUser) // admin에서 직접 user만들기

userRouter.post('/login', userController.loginWithEmail) //post 'api/user/login'
userRouter.post('/google', userController.loginWithGoogle)//post 'api/user/google'
userRouter.post('/credit-coupon', userController.updateCreditCoupon)
userRouter.get('/me', authController.authenticate, userController.getUser) //post 'api/user/me'
userRouter.get('/', authController.authenticate, authController.checkAdminPermission, userController.getUserList)
userRouter.get('/verify-token', authController.verifyToken)
userRouter.put('/', authController.authenticate, authController.checkAdminPermission, userController.updateUser)

userRouter.put('/viewed', authController.authenticate,userController.updatedUserViewed)


module.exports = userRouter;