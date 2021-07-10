var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { page: "Home" });
});

/* GET rankings page. */
router.get('/ranking', function(req, res, next) {
  res.render('ranking', {page: "Rankings"});
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('about', {page: "About"});
});

module.exports = router;
