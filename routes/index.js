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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
