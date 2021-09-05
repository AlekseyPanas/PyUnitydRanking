const db = require("../db/db");
const util = require('../utils/utils.js');

module.exports = (router) => {
    
    /* GET Login Page */
    router.all('/login', async (req, res, next) => {
        // Checks for a redirect query param and sets it to var
        let redirect_query = req.query.login_redirect_url;
        if (redirect_query == '/login' || redirect_query == "/create-account") {  // No redirecting back to login
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

        if (!!req.body.credential) {
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
        } else {
            res.redirect("/login");
        }
    });


    /* GET Account creation/finalization page */
    router.all('/create-account', async (req, res, next) => {
        // Gets account
        let account = await db.accounts.get_account_by_id(req.session.account_id);
        let is_finalized;

        // If you are logged in and finalized, takes back to login. Login page will handle further redirects
        if (!!account) {
            is_finalized = db.accounts.is_account_finalized(account);
            
            if (is_finalized) {
                res.redirect("/login");
            }   
        }

        /* ======== RENDER CREATE ACCOUNT ======== */
        res.render("hub/hub_casing", {
            // Base Casing Requirements
            page: "Dashboard",
            account: account,
            discord_server: process.env.DISCORD_INVITE,
            is_logo: false,

            // View name and params
            view_name: "hub/create_account",
            view_params: {}
        });
    });


    /* GET dashboard */
    router.get('/dashboard', async (req, res, next) => {
        // Gets account
        let account = await db.accounts.get_account_by_id(req.session.account_id);
        
        // If logged in
        if (!!account) {
            let is_finalized = db.accounts.is_account_finalized(account);

            if (is_finalized) {
                /* ======== RENDER DASHBOARD ======== */
                res.render("hub/hub_casing", {
                    // Base Casing Requirements
                    page: "Dashboard",
                    account: account,
                    discord_server: process.env.DISCORD_INVITE,
                    is_logo: false,

                    // View name and params
                    view_name: "hub/about",
                    view_params: {}
                });
            } else {
                res.redirect("/create-account");
            }
        } else {
            res.redirect("/login");
        }
    });


    /* GET main hub about page */
    router.get('/about', async (req, res, next) => {
        // Gets account
        let account = await db.accounts.get_account_by_id(req.session.account_id);

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
        let account = await db.accounts.get_account_by_email(req.body.email);
    
        // Login successful
        if (!!account && account.password_hash == util.hashPassword(req.body.password)) {
            req.session.account_id = account.account_id;
            
            res.send("1");
        } else {
            // Login failed
            res.send("0");
        }
    });

    // Ajax call for account creation to work
    router.post("/ajax/createaccountcheck", async (req, res, next) => {
        let account = await db.accounts.get_account_by_id(req.session.account_id);
        
        // Turns form data into object
        let formData = {}
        JSON.parse(req.body.formData).map((itm) => {formData[itm.name] = itm.value});
        
        // Returns data indicating what happened with account creation (any errors)
        let return_json = {}

        // Validates email field if it exists
        if (!!formData.email) {
            let is_match = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(formData.email);
            let is_dupe = !!(await db.accounts.get_account_by_email(formData.email));
            return_json.email = is_match && !is_dupe;
        }
        // Validates display_name field if it exists
        if (!!formData.display_name) {
            return_json.display_name = /^[A-Za-z0-9_-]*$/.test(formData.display_name);
        }
        // Validates password field if it exists
        if (!!formData.password) {
            return_json.password = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(formData.password);
            return_json.confirm_password = formData.password == formData.confirm_password;
        }

        // Checks if there are any errors
        let is_error = false;
        Object.values(return_json).map((bool) => { if (!bool) {is_error = true;} });
        return_json.is_error = is_error;
        
        // If no errors, creates or finalized account
        if (!is_error) {
            if (!!account) {
                console.log("Account being updated");
                // Updates account with provided data
                await db.accounts.update_account(account.account_id, formData.password, formData.display_name, null);
            } else {
                // Creates new account with provided data and logs user in
                if (!!formData.email) {
                    let account_id = await db.accounts.create_account(
                        formData.email, 
                        util.hashPassword(formData.password),
                        formData.display_name,
                        null);
                    
                    req.session.account_id = account_id;
                    console.log("created and logged_in");
                } else {
                    console.log("Session somehow expired");
                    // This code might run if session expired during account finalization
                    return_json.is_session_expired = true;
                }
            }
        }       
        console.log("final return", return_json); 

        res.json(return_json);
    });
};
