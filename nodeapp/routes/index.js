var express = require('express');
var db = require("../db/db");
var router = express.Router();



/* GET home page. */
router.get('/', async (req, res, next) => {
  res.render('index', { 
    page: "Home", 
    articles: await db.get_latest_articles(process.env.ARTICLE_BATCH_SIZE)
  });
});



/* GET rankings page. */
router.get('/ranking', async (req, res, next) => {
  // Finds latest year
  let years = await db.get_years();
  let latest_year;
  for (i = 0; i < years.length; i++) {
    if (!(!!latest_year) || years[i].year_id > latest_year.year_id) {
      latest_year = years[i];
    }
  }

  // Redirects to latest year page
  res.redirect("/ranking/" + latest_year.year_id);
});



/* GET individual rankings pages */
router.get('/ranking/:year_id', async (req, res, next) => {
  let years = await db.get_years();
  let selected_year = years.filter((yr) => {return yr.year_id == req.params.year_id})[0];

  res.render('ranking', {
    page: "Rankings",
    years: years,
    selected_year: selected_year,
    teams: await (db.get_teams_in_year(selected_year.year_id))
  });
})

/* GET about page. */
router.get('/about', async (req, res, next) => {
  res.render('about', {page: "About"});
});

/* GET articles */
router.get('/article/:article_url', async (req, res, next) => {
  // Retrieves article by URL
  let article_data = await db.get_article_by_url(req.params.article_url);

  // If article exists, renders it
  if (!!article_data) {
    res.render("article", {
      page: article_data.article_title,
      article: article_data
    });
  // Otherwise redirects to 404
  } else {
    res.render("error", {
      page: "error", 
      message: "Article Not Found", 
      error: {
        stack: "", 
        status: "404"
      }
    });
  }
});

/*
   _     __    _  __  __
  /_\    \ \  /_\ \ \/ /
 //_\\    \ \//_\\ \  / 
/  _  \/\_/ /  _  \/  \ 
\_/ \_/\___/\_/ \_/_/\_\                      
*/

router.post("/ajax/get-next-articles-batch", async (req, res, next) => {
  let earliest_ID = req.body.earliest_article_ID

  if (!(!!earliest_ID)) {
    // Error Handing here
    // This occurs if the frontend didnt record the earliest ID for some reason
    res.send(-1);
  } else {
    // Make a long ass loop to see that beautiful loading icon
    for (i = 0; i < 100000000; i++) {}

    // Retrieves next batch of articles and sends them
    res.json(await db.get_article_range(earliest_ID, process.env.ARTICLE_BATCH_SIZE));
  }
  
});

module.exports = router;
