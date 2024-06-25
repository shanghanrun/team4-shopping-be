const express = require('express')
const productRouter = express.Router()
const productController =require('../controllers/productController')
const authController =require('../controllers/authController')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

productRouter.post('/', authController.authenticate, authController.checkAdminPermission, productController.createProduct)


productRouter.get('/', productController.getProductList)
productRouter.get('/low-stock-products', productController.getLowStockProducts)


productRouter.get('/cloud-product-to-json', productController.cloudProduct2Json)
productRouter.get('/json-product-to-cloud', productController.jsonProduct2Cloud)

productRouter.get('/:id', productController.getProductById)
productRouter.delete('/:id', authController.authenticate, authController.checkAdminPermission, productController.deleteProduct)
productRouter.put('/:id', authController.authenticate, authController.checkAdminPermission, productController.updateProduct)

productRouter.post('/viewed', authController.authenticate, productController.getViewedList)
productRouter.post('/get-often-buy-list', authController.authenticate,productController.getOftenBuyList)




module.exports =productRouter