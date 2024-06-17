const express = require('express')
const movieRouter = express.Router()
const movieController = require('../controllers/movieController')

movieRouter.post('/', movieController.createUserMovie)
movieRouter.post('/get-movies', movieController.getUserMovies)

module.exports = movieRouter;