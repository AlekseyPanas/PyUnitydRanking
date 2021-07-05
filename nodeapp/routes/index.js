var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('ranking');
  //res.render('index', { title: 'Express' });
});

/* GET rankings page. */
router.get('/ranking', function(req, res, next) {
  res.render('ranking', {page: "Rankings"});
});

module.exports = router;
