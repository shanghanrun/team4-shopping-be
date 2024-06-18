const express = require('express')
const productRouter = express.Router()
const productController =require('../controllers/productController')
const authController =require('../controllers/authController')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

productRouter.post('/', authController.authenticate, authController.checkAdminPermission, productController.createProduct)


productRouter.get('/', productController.getProductList)
productRouter.get('/low-stock-products', productController.getLowStockProducts)


productRouter.get('/cloudDb-to-json', productController.cloudDb2Json)
productRouter.get('/json-to-cloudDb', productController.json2CloudDb)


productRouter.get('/:id', productController.getProductById)
productRouter.delete('/:id', authController.authenticate, authController.checkAdminPermission, productController.deleteProduct)
productRouter.put('/:id', authController.authenticate, authController.checkAdminPermission, productController.updateProduct)





module.exports =productRouter