var sqlite3 = require('sqlite-async');

// Use this function when calling any queries that write to database. query param is a string with the query
const write_query = async (db, query, params=[]) => {
    // Use '?' in query where parameters would go

    // Creates while loop control variable
    let valid = false;
    // Attempts to run query repeatedly until it works
    while (!valid) {
        // Sets initially to true (innocent until proven guilty)
        valid = true;
        // inserts into database and catches error (specifically the BUSY error)
        let response = await db.run(query, params).catch(err => {valid = false; /* Sets valid to false on error */ });
    };

    // Sends back db response (error if failed)
    return response;
}

// Retrieves 5 latest articles
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
    db.close()

    console.log("here")
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

module.exports = {
    get_latest_articles: (how_many) => get_latest_articles(how_many),
    get_article_range: (below_ID_exclusive, how_many) => get_article_range(below_ID_exclusive, how_many),
    get_article_by_url: (url) => get_article_by_url(url)
};