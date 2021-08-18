var sqlite3 = require('sqlite-async');

// Use this function when calling any queries that write to database. query param is a string with the query
const write_query = async (db, query, params=[]) => {
    // Use '?' in query where parameters would go

    // Creates while loop control variable
    let valid = false;
    let response;
    // Attempts to run query repeatedly until it works
    while (!valid) {
        // Sets initially to true (innocent until proven guilty)
        valid = true;
        // inserts into database and catches error (specifically the BUSY error)
        response = await db.run(query, params).catch(err => {valid = false; /* Sets valid to false on error */ });
    };

    // Sends back db response (error if failed)
    return response;
}

// Retrieves x latest articles
const get_latest_articles = async (how_many) => {
    // Opens connection
    let db = await sqlite3.open('./db/db.db');

    // Gets 5 Latest articles
    let articles = await db.all("SELECT article_id, publish_date_string, article_title, article_url_title, content_html, summary, cover_image_path FROM articles ORDER BY article_id DESC LIMIT ?;", [how_many]);

    // Closes connection
    db.close();

    // Return those articles
    return articles.map((art) => {return {
        article_id: art.article_id,
        publish_date_string: art.publish_date_string,
        article_title: art.article_title,
        article_url_title: art.article_url_title,
        content_html: art.content_html,
        summary: art.summary,
        cover_image_path: art.cover_image_path
    }});
}

// Get X articles below a given ID
const get_article_range = async (below_ID_exclusive, how_many) => {
    // Opens connection
    let db = await sqlite3.open('./db/db.db');

    // Gets articles within the specified ID range (below a given ID, and quantity)
    let articles = await db.all("SELECT article_id, publish_date_string, article_title, article_url_title, content_html, summary, cover_image_path FROM articles WHERE article_id < ? ORDER BY article_id DESC LIMIT ?;", [below_ID_exclusive, how_many]);

    // Closes connection
    db.close()

    // Return those articles
    return articles.map((art) => {return {
        article_id: art.article_id,
        publish_date_string: art.publish_date_string,
        article_title: art.article_title,
        article_url_title: art.article_url_title,
        content_html: art.content_html,
        summary: art.summary,
        cover_image_path: art.cover_image_path
    }});
}

// Get article by title url (ie test-article-4)
const get_article_by_url = async (url) => {
    // Opens connection
    let db = await sqlite3.open('./db/db.db');

    // Gets article
    let art = await db.get(`SELECT article_id, 
    publish_date_string, 
    article_title, 
    article_url_title, 
    content_html, 
    summary, 
    cover_image_path FROM articles WHERE article_url_title = ?;`, [url]);

    // Closes connection
    db.close();

    // Return found article (or null)
    return !!art ? {
        article_id: art.article_id,
        publish_date_string: art.publish_date_string,
        article_title: art.article_title,
        article_url_title: art.article_url_title,
        content_html: art.content_html,
        summary: art.summary,
        cover_image_path: art.cover_image_path
    }: null;
}

// Get all years
const get_years = async () => {
    // Opens connection
    let db = await sqlite3.open('./db/db.db');

    // Gets all years as json
    let years = (await db.all("SELECT year_id, year_name FROM years;")).map((i) => {return {
        year_id: i.year_id,
        year_name: i.year_name
    }});

    // Closes connection
    db.close();

    return years
}

// Returns all teams in a given year
const get_teams_in_year = async (year_id) => {
    // Opens connection
    let db = await sqlite3.open('./db/db.db');

    // Gets all teams of a specific year, as well as their members
    let teams = (await (db.all("SELECT team_id, team_name, team_letter, hackathon_points FROM teams WHERE year_id = ?;", [year_id]))).map((i) => {
        return {
            team_id: i.team_id,
            team_name: i.team_name,
            team_letter: i.team_letter,
            hackathon_points: i.hackathon_points
        };
    });
    for (const team of teams) {
        team.members = (await (db.all(`SELECT u.user_id, u.user_name, l.position, l.user_profile_path FROM year_member_links l INNER JOIN users u ON u.user_id = l.user_id WHERE l.team_id = ? AND l.year_id = ?;`, [team.team_id, year_id])));
        //console.log(JSON.stringify(team.members));
    }

    // Closes connection
    db.close();

    return teams;
}

/*
  ___                            _       
 / _ \                          | |      
/ /_\ \ ___ ___ ___  _   _ _ __ | |_ ___ 
|  _  |/ __/ __/ _ \| | | | '_ \| __/ __|
| | | | (_| (_| (_) | |_| | | | | |_\__ \
\_| |_/\___\___\___/ \__,_|_| |_|\__|___/
*/

// Creates an unfinished account entry with identity email (and optional profile pic)
// This account will be finalized within the account creation page
const create_unfinalized_account = async (email, profile_image=null) => {
    // Opens connection
    let db = await sqlite3.open('./db/db.db');

    let response;
    // Inserts email and the optional profile image into new entry
    if (!!profile_image) {
        response = await write_query(db, "INSERT INTO accounts (email, profile_image_path) VALUES (?, ?);", [email, profile_image])
    } else {
        response = await write_query(db, "INSERT INTO accounts (email) VALUES (?);", [email])
    }   

    // Closes connection
    db.close();

    // Returns id of account
    return response.lastID;
}

// Finalizes an unfinalized account entry based on id
const finalize_account = async (account_id, display_name, password_hash) => {
    // Opens connection
    let db = await sqlite3.open('./db/db.db');

    let response = await write_query(db, `UPDATE accounts SET 
                                            display_name = ?, 
                                            password = ?, 
                                            is_account_finalized = 1 
                                            WHERE account_id = ?;`, [display_name, password_hash, account_id])

    // Closes connection
    db.close();

    return response;
}

const get_account_by_id = async (account_id) => {
    // Opens connection
    let db = await sqlite3.open('./db/db.db');

    // Gets account matching the ID (hopefully only 1 account comes up)
    let account = await db.all("SELECT account_id, display_name, email, password, user_id, profile_image_path, is_account_finalized FROM accounts WHERE account_id = ?;", [account_id])

    // Closes connection
    db.close();

    if (!!account.length) {
        return account[0];
    } else {
        return null;
    }
}

const get_account_by_email = async (email) => {
    // Opens connection
    let db = await sqlite3.open('./db/db.db');

    // Gets account matching the ID (hopefully only 1 account comes up)
    let account = await db.all("SELECT account_id, display_name, email, password, user_id, profile_image_path, is_account_finalized FROM accounts WHERE email = ?;", [email])

    // Closes connection
    db.close();

    if (!!account.length) {
        return account[0];
    } else {
        return null;
    }
}

module.exports = {
    get_latest_articles: (how_many) => get_latest_articles(how_many),
    get_article_range: (below_ID_exclusive, how_many) => get_article_range(below_ID_exclusive, how_many),
    get_article_by_url: (url) => get_article_by_url(url),
    get_years: () => get_years(),
    get_teams_in_year: (year_id) => get_teams_in_year(year_id),
    create_unfinalized_account: (email, profile_image=null) => create_unfinalized_account(email, profile_image),
    finalize_account: (account_id, display_name, password_hash) => finalize_account(account_id, display_name, password_hash),
    get_account_by_email: (email) => get_account_by_email(email),
    get_account_by_id: (account_id) => get_account_by_id(account_id)
};