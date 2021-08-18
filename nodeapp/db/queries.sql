/* Build Tables 
   ============ */
CREATE TABLE "accounts" (
	"account_id" INTEGER PRIMARY KEY ASC,
    "display_name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "user_id" INTEGER, /* Links to users db entry if this account belongs to someone who was part of the BTHS club */
    "profile_image_path" TEXT, /* Web image URL or relative to public folder */
    "is_account_finalized" INTEGER
);

CREATE TABLE "users" (
	"user_id" INTEGER PRIMARY KEY ASC,
    "user_name" TEXT
);

CREATE TABLE "years" (
	"year_id" INTEGER PRIMARY KEY ASC,
    "year_name" TEXT
);

CREATE TABLE "year_member_links" (
	"user_id" INTEGER,
    "year_id" INTEGER,
    "team_id" INTEGER,
    "position" TEXT,
    "user_profile_path" TEXT
);

CREATE TABLE "award_winners" (
    "user_id" INTEGER,
    "award_id" INTEGER,
    "year_id" INTEGER
);

CREATE TABLE "teams" (
    "team_id" INTEGER PRIMARY KEY ASC,
    "year_id" INTEGER,
    "team_name" TEXT,
    "team_letter" TEXT,
    "hackathon_points"	INTEGER
);

CREATE TABLE "awards" (
    "award_id" INTEGER PRIMARY KEY ASC,
    "award_name" TEXT,
    "award_image_path" TEXT
);

CREATE TABLE "articles" (
    "article_id" INTEGER PRIMARY KEY ASC,
    "publish_date_string" TEXT,
    "article_title" TEXT,
    "article_url_title" TEXT,
    "content_html" TEXT,
    "summary" TEXT,
    "cover_image_path" TEXT
);


/* TESTING/ADMIN QUERIES
   =============== */

/* Get detailed user list */
select u.user_name, t.team_name, t.team_letter, y.position from year_member_links y 
INNER JOIN teams t ON t.team_id = y.team_id
INNER JOIN users u ON u.user_id = y.user_id;

/* Create new article */
INSERT INTO articles 
(publish_date_string, 
article_title, 
article_url_title, 
content_html, 
summary, 
cover_image_path) VALUES (
'7-14-2021',
'Test Article 2',
'test-article-2',
'<p> A test article </p>',
'A test article',
'https://techbeacon.scdn7.secure.raxcdn.com/sites/default/files/styles/article_hero_image/public/field/image/testing-trends-world-quality-report.jpg?itok=vUyONZsj'
);

/* Create new Team */
INSERT INTO teams (
    year_id, 
    team_name, 
    team_letter, 
    hackathon_points
) VALUES (
    1,
    'Test Team'
    'A'
    45
)

/* Create new User */
INSERT INTO users (
    user_name
) VALUES (
    'Dick Dickson'
)

/* Create new Year Member Link (remove profile path if no image that year) */
INSERT INTO year_member_links (
    user_id,
    year_id,
    team_id,
    position,
    user_profile_path
) VALUES (
    1,
    1,
    1,
    'Member',
    '/images/profiles/unknown.png'
)