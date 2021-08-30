const db = require("../db/db");
const crypto = require('crypto');

// Gets the latest time period of a given org
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

// Hashes password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}


// Uses app to render a given ejs template and returns an awaitable promise
async function getRenderedPage(app, view, data) {
    return (new Promise((resolve, reject) => {
        app.render(view, data, (error, html) => {
            if (!!error) {
                reject(error);
            } else {
                resolve(html);
            }
        })
    }));
}

module.exports = {
    hashPassword: hashPassword,
    decodeJWT: decodeJWT,
    getLatestYear: getLatestYear,
    getRenderedPage: getRenderedPage
}
