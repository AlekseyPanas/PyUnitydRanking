const db = require("../db/db");
const util = require('../utils/utils.js');

module.exports = (router) => {
    
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
                discord_server: process.env.DISCORD_INVITE,
                account: account,

                domain: process.env.DOMAIN
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
                    account: account,
                    discord_server: process.env.DISCORD_INVITE,
                });
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
};
