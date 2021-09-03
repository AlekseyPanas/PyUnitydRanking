const db = require("../db/db");
const util = require('../utils/utils.js');

module.exports = (router) => {
    
    /* GET Login Page */
    router.all('/login', async (req, res, next) => {
        // Checks for a redirect query param and sets it to var
        let redirect_query = req.query.login_redirect_url;
        if (redirect_query == '/login') {  // No redirecting back to login
            redirect_query = undefined;
        }
        // Checks for redirect cookie and sets it to var
        let redirect_cookie = req.cookies.login_redirect_url

        // If user logged in
        if (!!req.session.account_id) {

            // Redirects with priority: cookie, query, dashboard
            if (!!redirect_cookie) { res.redirect(redirect_cookie); 
            } else if (!!redirect_query) { res.redirect(redirect_query);
            } else { res.redirect("/dashboard") }

        } else {
            // Sets a cookie to store redirect (or removes it)
            if (!!redirect_query) {
                res.cookie("login_redirect_url", redirect_query);
            } else {
                res.clearCookie("login_redirect_url");
            }

            /* ======== RENDER LOGIN ======== */
            res.render("hub/hub_casing", {
                // Base Casing Requirements
                page: "Login",
                account: undefined,
                discord_server: process.env.DISCORD_INVITE,
                is_logo: false,

                // View name and params
                view_name: "hub/login",
                view_params: {
                    domain: process.env.DOMAIN
                }
            });
        }
    });

    // Destroys session and goes back to login or redirect
    router.get('/logout', async (req, res, next) => {
        req.session.destroy(() => {
            res.redirect(req.query.logout_redirect_url ? req.query.logout_redirect_url : "/login");
        });
    });

    /* POST google login info and redirect to account creation */
    router.post('/google-login', async (req, res, next) => {

        // Gets the middle part of the JWT, which includes all the user data
        let userData = util.decodeJWT(req.body.credential)[1];

        // Checks to see if an account entry exists
        let account = await db.accounts.get_account_by_email(userData.email);
        // If account exists
        if (!!account) {

            // Creates session (logs in the user)
            req.session.account_id = account.account_id;

            // Takes you back to login where shit'll happen
            res.redirect("/login");
        }

        // If account doesn't exist
        else {
            // Creates account
            let accountID = await db.accounts.create_account(userData.email, null, null, userData.picture);

            // Creates session (logs in the user)
            req.session.account_id = accountID;

            // Redirects to login
            res.redirect("/login");
        }
    });


    /* GET Account creation/finalization page */
    router.all('/create-account', async (req, res, next) => {
        // Gets account
        let account = await db.get_account_by_id(req.session.account_id);

        if (!(!!account)) {
            res.render("create_account", {
                page: "Create Account",
                account: account,
                discord_server: process.env.DISCORD_INVITE,
            });
        }

        else if (!!req.session.account_id) {
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
                    account: account,
                    discord_server: process.env.DISCORD_INVITE,
                });
            }
        }
    });


    router.get('/about', async (req, res, next) => {
        // Gets account
        console.log("TEST START");
        let account = await db.accounts.get_account_by_id(req.session.account_id);
        console.log("TEST END");

        /* ======== RENDER ABOUT ======== */
        res.render("hub/hub_casing", {
            // Base Casing Requirements
            page: "About",
            account: account,
            discord_server: process.env.DISCORD_INVITE,
            is_logo: true,

            // View name and params
            view_name: "hub/about",
            view_params: {}
        });
    });

    /*
       _     __    _  __  __
      /_\    \ \  /_\ \ \/ /
     //_\\    \ \//_\\ \  / 
    /  _  \/\_/ /  _  \/  \ 
    \_/ \_/\___/\_/ \_/_/\_\                      
    */

    // Ajax call for manual login form to work
    router.post("/ajax/logincheck", async (req, res, next) => {
        let account = await db.get_account_by_email(req.body.email);
    
        // Login successful
        if (!!account && account.password == util.hashPassword(req.body.password)) {
            req.session.account_id = account.account_id;
            
            res.send("1");
        } else {
            // Login failed
            res.send("0");
        }
    });
};
