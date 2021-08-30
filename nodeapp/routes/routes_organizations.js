const db = require("../db/db");
const util = require('../utils/utils.js');

module.exports = (router) => {

    /* GET home page. */
    router.get('/:org/', async (req, res, next) => {
        console.log("WE ARE INDEED HERE")
        // Gets account for nav bar purposes
        let account = await db.get_account_by_id(req.session.account_id);
    
        res.render('index', {
            page: "Home",
            discord_server: process.env.DISCORD_INVITE,
            account: account,
    
            articles: await db.get_latest_articles(process.env.ARTICLE_BATCH_SIZE)
        });
    });

    /* GET rankings page. */
    router.get('/:org/ranking', async (req, res, next) => {
        // Redirects to latest year page
        res.redirect("/ranking/" + (await getLatestYear()).year_id);
    });

    /* GET individual rankings pages */
    router.get('/:org/ranking/:time_period_id', async (req, res, next) => {
        let account = await db.get_account_by_id(req.session.account_id);
    
        let years = await db.get_years();
        let selected_year = years.filter((yr) => { return yr.year_id == req.params.year_id })[0];
        // If year doesnt exist, redirect to latest
        if (!selected_year) {
            res.redirect("/members/" + (await getLatestYear()).year_id);
        };
    
        res.render('ranking', {
            page: "Rankings",
            account: account,
            discord_server: process.env.DISCORD_INVITE,
    
            years: years,
            selected_year: selected_year,
            teams: await (db.get_teams_in_year(selected_year.year_id))
        });
    });

    /* GET about page. */
    router.get('/:org/about', async (req, res, next) => {
        let account = await db.get_account_by_id(req.session.account_id);
    
        res.render('about', { 
            page: "About",
            account: account,
            discord_server: process.env.DISCORD_INVITE,
        });
    });

    /* GET articles */
    router.get('/:org/article/:article_url', async (req, res, next) => {
        let account = await db.get_account_by_id(req.session.account_id);
    
        // Retrieves article by URL
        let article_data = await db.get_article_by_url(req.params.article_url);
    
        // If article exists, renders it
        if (!!article_data) {
            res.render("article", {
                page: article_data.article_title,
                account: account,
                discord_server: process.env.DISCORD_INVITE,
    
                article: article_data
            });
            // Otherwise redirects to 404
        } else {
            res.render("error", {
                page: "error",
                account: account,
                message: "Article Not Found",
                error: {
                    stack: "",
                    status: "404"
                }
            });
        }
    });

    /* GET members */
    router.get('/:org/members', async (req, res, next) => {
        // Redirects to latest year page
        res.redirect("/members/" + (await getLatestYear()).year_id);
    });

    /* GET individual members pages */
    router.get('/:org/members/:year_id', async (req, res, next) => {
        let account = await db.get_account_by_id(req.session.account_id);
    
        let years = await db.get_years();
        let selected_year = years.filter((yr) => { return yr.year_id == req.params.year_id })[0];
        // If year doesnt exist, redirect to latest
        if (!selected_year) {
            res.redirect("/members/" + (await getLatestYear()).year_id);
        };
    
        res.render('members', {
            page: "Members",
            discord_server: process.env.DISCORD_INVITE,
            account: account,
    
            years: years,
            selected_year: selected_year,
            teams: await (db.get_teams_in_year(selected_year.year_id)),
        });
    })

    /* GET projects */
    router.get('/:org/projects', async (req, res, next) => {
        let account = await db.get_account_by_id(req.session.account_id);
    
        let debug_game_sample = Array.from({length: 20}, e => {return {
            title: "",
            cover_img_path: "https://w7.pngwing.com/pngs/407/957/png-transparent-gray-wolf-agar-io-video-game-logo-youtube-youtube-game-emblem-dragon-thumbnail.png",
            desc: "This game card is a sample meant to demonstrate animations. Actual games coming soon",
            author: "UnknownDev",
            release_year: 2032,
    
            roblox_link: (Math.random() < 0.5) ? null : "ting",
            github_link: (Math.random() < 0.5) ? null : "ting",
            other_link: (Math.random() < 0.5) ? null : "ting",
    
            windows_download: (Math.random() < 0.5) ? null : "ting",
            mac_download: (Math.random() < 0.5) ? null : "ting",
            universal_download: (Math.random() < 0.5) ? null : "ting",
        }});
        for (i=0; i<debug_game_sample.length; i++) {
            debug_game_sample[i].title = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10) + i.toString();
        }
        console.log(debug_game_sample);
    
        res.render("projects", {
            page: "Projects",
            account: account,
            discord_server: process.env.DISCORD_INVITE,
            
            games_per_page: process.env.PROJECT_PAGE_GAMES_PER_PAGE,
            games: debug_game_sample
        });
    });

    /* GET Dashboard */
    router.get('/:org/dashboard', async (req, res, next) => {
        // Checks if logged in
        if (!!req.session.account_id) {
            let account = await db.get_account_by_id(req.session.account_id);
            
            // Checks if account is finalized and makes decision accordingly
            if (!!account.is_account_finalized) {
                res.render("dashboard", {
                    page: "Dashboard",
                    account: account,
                    discord_server: process.env.DISCORD_INVITE,
                });
            } 
            
            // Not finalized!
            else {
                res.redirect("/create-account");
            }
        } else {
            res.redirect("/login");
        }
    });

    /*
       _     __    _  __  __
      /_\    \ \  /_\ \ \/ /
     //_\\    \ \//_\\ \  / 
    /  _  \/\_/ /  _  \/  \ 
    \_/ \_/\___/\_/ \_/_/\_\                      
    */

    /* Gets next home page articles batch */
    router.post("/:org/ajax/get-next-articles-batch", async (req, res, next) => {
        let earliest_ID = req.body.earliest_article_ID
    
        if (!(!!earliest_ID)) {
            // Error Handing here
            // This occurs if the frontend didnt record the earliest ID for some reason
            res.send(-1);
        } else {
            // Make a long ass loop to see that beautiful loading icon
            for (i = 0; i < 10000000; i++) { }
    
            // Retrieves next batch of articles
            let articles = await db.get_article_range(earliest_ID, process.env.ARTICLE_BATCH_SIZE)
            // Maps an async function to render the pages, and awaits all articles to be rendered
            let sending = await Promise.all(articles.map(async (article) => {
                return (await getRenderedPage(req.app, "partials/article_cover", {article: article}));
            }));
            // Sends the completed articles
            res.json(sending);
        }
    
    });
};
