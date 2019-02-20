var express = require('express');
var router = express.Router();
// le module request permet à l'API de pouvoir request une autre API
var request = require('request');
// mongoose fait le pont entre l'API et mlab
var mongoose = require('mongoose');
// option de connection à mlab
var options = { connectTimeoutMS: 5000, useNewUrlParser: true };
// import les donnèes sensibles
var login = require("../login.log");
// module crypter les passwords
const bcrypt = require('bcrypt');
// crypt les passwords
var salt = login.salt;

// connexion à mlab
mongoose.connect(`mongodb://${login.userMLab}:${login.userPasswordMlab}@ds139435.mlab.com:39435/mymovies`,
    options,
    function(err) {
     console.log(err);
    }
);

var userSchema = mongoose.Schema({ userName: String, email: String, password: String,});
var userModel = mongoose.model('user', userSchema);

// return la date d'aujourd'hui au format anglophone
var currentDate = function () {
  let newDate = new Date()
  let year = newDate.getFullYear()
  let month = newDate.getMonth() + 1
  let day = newDate.getDate()
  let date = year + "-" + month + "-" + day
  return date
}

// Vérifie que le pseudo comporte entre 3 et 20 caractéres
const userNameIsValid = userName => {
  let isValid = false
  if(userName.length >= 3 && userName.length <= 20){
    isValid = true
  }
  return isValid;
};

// Vérifie que le password comporte entre 4 et 15 caractéres
const passwordIsValid = password => {
  let isValid = false
  if(password.length >= 4 && password.length <= 15){
    isValid = true
  }
  return isValid;
};

const emailIsValid = email => {
  let isValid = false
  if(email.length >= 5 && email.length <= 40){
    isValid = true
  }
  return isValid;
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

// Inscription
router.post('/signup', function(req, res, next) {
  let isExist = false;
  let readyToDb = false;
  console.log(req.body);
  if(!userNameIsValid(req.body.userName)){
    res.json({ userNameValid: false});
  } else if(!passwordIsValid(req.body.password)){
      res.json({ passwordValid: false});
  } else if(!emailIsValid(req.body.email)){
      res.json({ emailValid: false})
  } else{
    readyToDb = true
  }

  if (readyToDb) {
    userModel.find(
      { email: req.body.email } ,
      function (err, users) {
        if (users.length == 0) {
          let hash = bcrypt.hashSync(req.body.password, salt);
          var newUser = new userModel ({
            userName: req.body.userName,
            email: req.body.email,
            password: hash,
          });
          newUser.save(
            function(error, user) {
              if (err){
                res.json({
                  signup : false,
                  result : err
                })
              } else {
                res.json({
                  signup : true,
                  result : user,
                })
              }
          });
        }
        else if (users.length > 0){
          isExist = true
          res.json({ isExist });
        }
      }
    )
  }
});

//Connexion
router.post('/signin', function(req, res, next) {
  var hash = bcrypt.hashSync(req.body.password, salt);
  userModel.find(
     {email: req.body.email, password: hash} ,
     function (err, users) {
       if(err){
         res.json({ err });
       }
       else{
         console.log(users);
         res.json({ users });
       }
     }
  )
})

module.exports = router;
