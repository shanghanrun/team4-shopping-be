const express = require('express')
const indexRouter = express.Router()
const userRouter = require('./userRouter')
const productRouter = require('./productRouter')
const cartRouter = require('./cartRouter')
const orderRouter = require('./orderRouter')
const movieRouter = require('./movieRouter')

indexRouter.use('/user', userRouter)
indexRouter.use('/product', productRouter)
indexRouter.use('/cart', cartRouter)
indexRouter.use('/order', orderRouter)
indexRouter.use('/movie', movieRouter)


module.exports = indexRouter;