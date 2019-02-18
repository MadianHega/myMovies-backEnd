var express = require('express');
var router = express.Router();

// return la date d'aujourd'hui au format anglophone
var currentDate = function () {
  let newDate = new Date()
  let year = newDate.getFullYear()
  let month = newDate.getMonth() + 1
  let day = newDate.getDate()
  let date = year + "-" + month + "-" + day
  return date
}

/* GET movieList*/
router.get('/movieList', function(req, res, next) {
  let movieList = []
  let newDate = currentDate()
  // Intérroge l'API Movie database sur les films sortie ultérieurement à la date actuelle
  request(`https://api.themoviedb.org/3/discover/movie?vote_count.lte.gte=5&release_date.lte=${newDate}&api_key=${login.keyMovieDatabase}&language=fr&region=fr`,
     function(error, response, body) {
       let brut = JSON.parse(body);
       let result = brut.results
       result.map((item) => {
         let movie = {}
         movie.id = item.id
         movie.title = item.title
         movie.overview = item.overview
         movie.img = "https://image.tmdb.org/t/p/w500" + item.poster_path
         movieList.push(movie)
       })
       res.json({ movieList: movieList});
  });
});


// GET likeMovieList
router.get('/likeMovieList', function(req, res, next) {
  let idLikeMovieList = ["424694", "438799", "375588"]
  let likeMovieList = []
  let test = function (idLikeMovieList) {
    return new Promise (function(resolve, reject) {
      idLikeMovieList.map((id) => {
        // Boucle sur le tableau likeMovieList est recherche dans l'API Movie database le film correspondant à l'id
        request(`https://api.themoviedb.org/3/movie/${id}?language=fr&api_key=${login.keyMovieDatabase}`,
           function(error, response, body) {
             let brut = JSON.parse(body);
             let movie = {}
             movie.id = brut.id
             movie.title = brut.title
             movie.overview = brut.overview
             movie.img = "https://image.tmdb.org/t/p/w500" + brut.poster_path
             likeMovieList.push(movie)
             if(idLikeMovieList.length === likeMovieList.length) {
               resolve(likeMovieList)
             }
        });
      })

    })
  }

  test(idLikeMovieList).then(
    function(response) {
      res.json({ movieList: response});
  })

});

module.exports = router;
