const express = require('express')
const orderRouter = express.Router()
const orderController =require('../controllers/orderController')
const authController = require('../controllers/authController')

orderRouter.post('/', authController.authenticate, orderController.createOrder)

// customer가 자신의 order를 볼 수 있도록 한다.
orderRouter.get('/', authController.authenticate, orderController.getOrderList)

// admin이 모든 order를 볼 수 있도록 함
orderRouter.get('/all', authController.authenticate, orderController.getAllUserOrderList)

// user의 order가져오기
orderRouter.get('/user-order/:id', orderController.getUserOrder)

// 모든 사람의 preparing order가져오기
orderRouter.get('/preparing',orderController.getPreparingOrders)

// 물품 배송상태를 admin이 수정함
orderRouter.put('/', authController.authenticate, authController.checkAdminPermission, orderController.updateOrder)

//모든 것이 완료되어 order지우기
orderRouter.delete('/:id', authController.authenticate, authController.checkAdminPermission, orderController.updateOrder)

module.exports =orderRouter