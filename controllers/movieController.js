const Movie = require('../model/Movie')
const User = require('../model/User')

const movieController={}

movieController.createUserMovie = async(req,res)=>{
	try{
		const {userId,title, seat,image} = req.body;
		let movie = await Movie.findOne({title, userId})
		if(movie){
			throw new Error('이미 존재합니다')
		}
		const newMovie = new Movie({userId,title,seat,image})
		await newMovie.save()
		res.status(200).json({status:'success', data:newMovie})
	}catch(e){
		res.status(400).json({status:'fail', error:e.message})
	}
}
movieController.getUserMovies = async(req, res)=>{
	try{
		const {userId} = req.body;
		const foundMovies = await Movie.find({userId})
		if(!foundMovies) throw new Error('아무것도 없습니다.')
		
		res.status(200).json({status:'success', data:foundMovies})
	}catch(e){
		res.status(400).json({status:'fail',error:e.message})
	}
}

module.exports = movieController;