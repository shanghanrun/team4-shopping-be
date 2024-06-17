const express = require('express')
const cartRouter = express.Router()
const cartController =require('../controllers/cartController')
const authController =require('../controllers/authController')

cartRouter.post('/', authController.authenticate, cartController.createCartItem)
cartRouter.get('/', authController.authenticate, cartController.getCart)
cartRouter.delete('/', authController.authenticate, cartController.emptyCart)
cartRouter.post('/:id', authController.authenticate, cartController.deleteCartItem)
cartRouter.put('/:id', authController.authenticate, cartController.updateItemQty)


module.exports =cartRouter