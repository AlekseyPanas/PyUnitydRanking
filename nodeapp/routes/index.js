var express = require('express');
var db = require("../db/db");
var router = express.Router();
var crypto = require('crypto');

/* Utility Functions */
async function getLatestYear() {
    // Finds latest year
    let years = await db.get_years();
    let latest_year;
    for (i = 0; i < years.length; i++) {
        if (!(!!latest_year) || years[i].year_id > latest_year.year_id) {
            latest_year = years[i];
        }
    }
    return latest_year;
}

// Returns 3 parts of decoded JWT
function decodeJWT(token) {
    return token.split(".").map((itm, idx) => {
        if (idx != 2) {
            return JSON.parse(Buffer.from(itm, 'base64'));
        } else {
            return { signature: Buffer.from(itm, 'base64').toString() }
        }
    });
}

// Hashes password based on email
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}



/* GET home page. */
router.get('/', async (req, res, next) => {
    // Gets account for nav bar purposes
    let account = await db.get_account_by_id(req.session.account_id);

    res.render('index', {
        page: "Home",
        account: account,
        articles: await db.get_latest_articles(process.env.ARTICLE_BATCH_SIZE)
    });
});



/* GET rankings page. */
router.get('/ranking', async (req, res, next) => {
    // Redirects to latest year page
    res.redirect("/ranking/" + (await getLatestYear()).year_id);
});

/* GET individual rankings pages */
router.get('/ranking/:year_id', async (req, res, next) => {
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
        years: years,
        selected_year: selected_year,
        teams: await (db.get_teams_in_year(selected_year.year_id))
    });
})




/* GET about page. */
router.get('/about', async (req, res, next) => {
    let account = await db.get_account_by_id(req.session.account_id);

    res.render('about', { 
        page: "About",
        account: account
    });
});





/* GET articles */
router.get('/article/:article_url', async (req, res, next) => {
    let account = await db.get_account_by_id(req.session.account_id);

    // Retrieves article by URL
    let article_data = await db.get_article_by_url(req.params.article_url);

    // If article exists, renders it
    if (!!article_data) {
        res.render("article", {
            page: article_data.article_title,
            account: account,
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
router.get('/members', async (req, res, next) => {
    // Redirects to latest year page
    res.redirect("/members/" + (await getLatestYear()).year_id);
});

/* GET individual rankings pages */
router.get('/members/:year_id', async (req, res, next) => {
    let account = await db.get_account_by_id(req.session.account_id);

    let years = await db.get_years();
    let selected_year = years.filter((yr) => { return yr.year_id == req.params.year_id })[0];
    // If year doesnt exist, redirect to latest
    if (!selected_year) {
        res.redirect("/members/" + (await getLatestYear()).year_id);
    };

    res.render('members', {
        page: "Members",
        years: years,
        selected_year: selected_year,
        teams: await (db.get_teams_in_year(selected_year.year_id)),
        account: account
    });
})




/* GET projects */
router.get('/projects', async (req, res, next) => {
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
        games_per_page: process.env.PROJECT_PAGE_GAMES_PER_PAGE,
        games: debug_game_sample
    });
});



// Destroys session and goes back to login
router.get('/logout', async (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});
/* GET Login Page */
router.all('/login', async (req, res, next) => {
    let account = await db.get_account_by_id(req.session.account_id);
    
    // If user already logged in, bring them to dash
    if (!!req.session.account_id) {
        res.redirect("/dashboard");
    } else {
        res.render("login", {
            page: "Login",
            domain: process.env.DOMAIN,
            account: account
        })
    }
});


/* POST google login info and redirect to account creation */
router.post('/google-login', async (req, res, next) => {

    // Gets the middle part of the JWT, which includes all the user data
    let userData = decodeJWT(req.body.credential)[1];
    console.log(userData);

    // Checks to see if an account entry exists
    let account = await db.get_account_by_email(userData.email);
    // If account exists
    if (!!account) {

        // Creates session (logs in the user)
        req.session.account_id = account.account_id;

        // If account is finalized
        if (account.is_account_finalized) {
            res.redirect("/dashboard");
        }
        // Otherwise redirects to finalization page
        else {
            res.redirect("/create-account")
        }
    }
    // If account doesn't exist
    else {
        // Creates account
        let accountID = await db.create_unfinalized_account(userData.email, userData.picture);
        console.log(accountID);

        // Creates session (logs in the user)
        req.session.account_id = accountID;

        // Redirects to account finalization
        res.redirect("/create-account");
    }
});


/* GET Account creation finalization page */
router.all('/create-account', async (req, res, next) => {
    if (!!req.session.account_id) {
        // Gets account
        let account = await db.get_account_by_id(req.session.account_id);

        // If account was already created...
        if (!!account.is_account_finalized) {
            res.redirect("/dashboard");
        } 
        // If the form was submitted to finalize account...
        else if (req.method == "POST") {
            let formData = req.body;
            
            // Double checks that form data is valid
            if (
                formData.displayname.match(/^[A-Za-z0-9_-]*$/) &&
                formData.pass.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/) &&
                formData.pass == formData.confirmpass
            ) {
                console.log("PASSWORD STUFF:")
                console.log(formData.pass)
                console.log(hashPassword(formData.pass))
                // Finalizes account
                await db.finalize_account(
                    account.account_id, 
                    formData.displayname,
                    hashPassword(formData.pass)
                );
                // Redirects to dash
                res.redirect("/dashboard");

            } else {
                // Throws you out if you dare tamper with frontend form validation
                res.redirect("/create-account");
            }
        } 
        // If account needs creating...
        else {
            res.render("create_account", {
                page: "Create Account",
                account: account
            });
        }
    } else {
        res.redirect("/login");
    }
});


/* GET Dashboard */
router.get('/dashboard', async (req, res, next) => {
    // Checks if logged in
    if (!!req.session.account_id) {
        let account = await db.get_account_by_id(req.session.account_id);
        
        // Checks if account is finalized and makes decision accordingly
        if (!!account.is_account_finalized) {
            res.render("dashboard", {
                page: "Dashboard",
                account: account
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

router.post("/ajax/get-next-articles-batch", async (req, res, next) => {
    let earliest_ID = req.body.earliest_article_ID

    if (!(!!earliest_ID)) {
        // Error Handing here
        // This occurs if the frontend didnt record the earliest ID for some reason
        res.send(-1);
    } else {
        // Make a long ass loop to see that beautiful loading icon
        for (i = 0; i < 100000000; i++) { }

        // Retrieves next batch of articles and sends them
        res.json(await db.get_article_range(earliest_ID, process.env.ARTICLE_BATCH_SIZE));
    }

});


// Ajax call for manual login form to work
router.post("/ajax/logincheck", async (req, res, next) => {
    let account = await db.get_account_by_email(req.body.email);

    // Login successful
    if (!!account && account.password == hashPassword(req.body.password)) {
        req.session.account_id = account.account_id;
        
        res.send("1");
    } else {
        // Login failed
        res.send("0");
    }
});


router.post("/ajax/load-page", async (req, res, next) => {
    let data = req.body;
    console.log(data);

    res.render("partials/project_game_card", {
        game: {
            title: "Whos your Daddy",
            cover_img_path: "https://w7.pngwing.com/pngs/407/957/png-transparent-gray-wolf-agar-io-video-game-logo-youtube-youtube-game-emblem-dragon-thumbnail.png",
            desc: "Find who your daddy is without getting caught",
            author: "UnknownDev",
            release_year: 2020,

            roblox_link: null,
            github_link: "Hello",
            other_link: null,

            windows_download: null,
            mac_download: null,
            universal_download: "Yep",
        }
    });
})

module.exports = router;
