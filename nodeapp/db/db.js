const { Pool } = require('pg');

const pool = new Pool({
    user: "postgres",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Query functions (Note use $1, $2, $2, ..., $n for parameters in query, and supply list for params in order of the params)
// ----------------

// Retrieves x latest articles
const get_latest_articles = async (how_many) => (
    await pool.query(
        `SELECT 
        article_id, organization_id, publish_date_utc, article_title, article_url_title, 
        content_html, summary, cover_image_path, is_announcement, is_public 
        FROM organization_articles ORDER BY article_id DESC LIMIT $1;`, [how_many])
    ).rows.map((art) => {
        return {
            article_id: art.article_id,
            organization_id: art.organization_id,
            publish_date_utc: art.publish_date_utc,
            article_title: art.article_title,
            article_url_title: art.article_url_title,
            content_html: art.content_html,
            summary: art.summary,
            cover_image_path: art.cover_image_path,
            is_announcement: art.is_announcement,
            is_public: art.is_public
        };
    });

// Get X articles below a given ID
const get_article_range = async (below_ID_exclusive, how_many) => (
    await pool.query(
        `SELECT 
        article_id, organization_id, publish_date_utc, article_title, article_url_title, 
        content_html, summary, cover_image_path, is_announcement, is_public 
        FROM organization_articles WHERE article_id < $1 ORDER BY article_id DESC LIMIT $2;`, [below_ID_exclusive, how_many])
    ).rows.map((art) => {
        return {
            article_id: art.article_id,
            organization_id: art.organization_id,
            publish_date_utc: art.publish_date_utc,
            article_title: art.article_title,
            article_url_title: art.article_url_title,
            content_html: art.content_html,
            summary: art.summary,
            cover_image_path: art.cover_image_path,
            is_announcement: art.is_announcement,
            is_public: art.is_public
        };
    });

// Get article by title url (ie test-article-4)
const get_article_by_url = async (url) => {
    let art = (await pool.query(
        `SELECT 
        article_id, organization_id, publish_date_utc, article_title, article_url_title, 
        content_html, summary, cover_image_path, is_announcement, is_public 
        FROM organization_articles WHERE article_url_title = $1;`, [url])).rows[0]
    
    return !!art ? {
            article_id: art.article_id,
            organization_id: art.organization_id,
            publish_date_utc: art.publish_date_utc,
            article_title: art.article_title,
            article_url_title: art.article_url_title,
            content_html: art.content_html,
            summary: art.summary,
            cover_image_path: art.cover_image_path,
            is_announcement: art.is_announcement,
            is_public: art.is_public
        } : null
};

// Get all time periods
const get_time_periods = async () => (
    await pool.query("SELECT period_id, organization_id, period_name, is_active FROM organization_time_periods;", [])
    ).rows.map((i) => {
        return {
            period_id: i.period_id,
            period_name: i.period_name,
            is_active: i.is_active,
            organization_id: i.organization_id
        };
    });

// Returns all teams in a given year
const get_teams_in_year = async (period_id) => {
    // Gets all teams of a specific year, as well as their members
    let teams = (await (pool.query("SELECT team_id, organization_id, period_id, team_name, hackathon_points FROM organization_teams WHERE period_id = $1;", [period_id]))).rows.map((i) => {
        return {
            team_id: i.team_id,
            organization_id: i.organization_id,
            period_id: i.period_id,
            team_name: i.team_name,
            team_letter: i.team_letter,
            hackathon_points: i.hackathon_points
        };
    });
    for (const team of teams) {
        team.members = (await (pool.query(`SELECT u.user_id, u.fist_name, u.last_name, m.user_profile_path FROM organization_memberships m INNER JOIN organization_users u ON u.user_id = m.user_id WHERE m.team_id = $1 AND m.period_id = $2;`, [team.team_id, team.period_id])));
        //console.log(JSON.stringify(team.members));
    }

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

// Export
module.exeports = {
    query: (sql_text, params) => pool.query(sql_text, params)
}
