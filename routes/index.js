const express = require('express')
const indexRouter = express.Router()
const userRouter = require('./userRouter')
const productRouter = require('./productRouter')
const cartRouter = require('./cartRouter')
const orderRouter = require('./orderRouter')
const movieRouter = require('./movieRouter')
const reviewRouter = require('./reviewRouter')
const replyRouter = require('./replyRouter')

indexRouter.use('/user', userRouter)
indexRouter.use('/product', productRouter)
indexRouter.use('/cart', cartRouter)
indexRouter.use('/order', orderRouter)
indexRouter.use('/movie', movieRouter)
indexRouter.use('/review', reviewRouter)
indexRouter.use('reply', replyRouter)


module.exports = indexRouter;