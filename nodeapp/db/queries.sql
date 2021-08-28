/* Build Schemas (folder structure in postgres)
   ============= */
CREATE SCHEMA orgs;

CREATE SCHEMA hub;

CREATE SCHEMA courses;

CREATE SCHEMA codebrawl;

/* Build Tables 
   ============ */
CREATE TABLE public.table_name
(
    a integer,
    b boolean,
    c text,
    d timestamp without time zone,
    PRIMARY KEY (a)
);

CREATE TABLE hub.hub_accounts
(
    account_id integer,
    display_name text,
    email text,
    password_hash text,
    profile_image_path text,
    PRIMARY KEY (account_id)
);

CREATE TABLE orgs.organization_users
(
    user_id integer,
    account_id integer,
    organization_id integer,
    first_name text,
    last_name text,
    is_owner boolean,
    about_me text,
    PRIMARY KEY (user_id)
);

CREATE TABLE orgs.organizations
(
    organization_id integer,
    title text,
    description text,
    head_logo_image_path text,
    nav_logo_image_path text,
    footer_logo_image_path text,
    url_name text,
    about_page_content text,
    PRIMARY KEY (organization_id)
);

CREATE TABLE orgs.organization_teams
(
    team_id integer,
    organization_id integer,
    period_id integer,
    team_name text,
    hackathon_points integer,
    PRIMARY KEY (team_id)
);

CREATE TABLE orgs.organization_time_periods
(
    period_id integer,
    organization_id integer,
    period_name text,
    is_active boolean,
    PRIMARY KEY (period_id)
);

CREATE TABLE orgs.organization_memberships
(
    membership_id integer,
    user_id integer,
    period_id integer,
    team_id integer,
    user_profile_path text,
    PRIMARY KEY (membership_id)
);

CREATE TABLE orgs.organization_projects
(
    project_id integer,
    team_id integer,
    title text,
    cover_img_path text,
    short_description text,
    long_description text,
    is_public boolean,
    PRIMARY KEY (project_id)
);

CREATE TABLE orgs.organization_project_versions
(
    version_id integer,
    project_id integer,
    title text,
    description_html text,
    release_date_utc timestamp without time zone,
    roblox_link text,
    github_link text,
    other_link text,
    windows_download_path text,
    mac_download_path text,
    universal_download_path text,
    PRIMARY KEY (version_id)
);

CREATE TABLE orgs.organization_team_messages
(
    message_id integer,
    team_id integer,
    sender_name text,
    message_contents text,
    utc_time_sent timestamp without time zone,
    PRIMARY KEY (message_id)
);

CREATE TABLE orgs.exec_messages
(
    exec_message_id integer,
    membership_id integer,
    sender_name text,
    sender_email text,
    message_contents text,
    utc_time_sent timestamp without time zone,
    PRIMARY KEY (exec_message_id)
);

CREATE TABLE orgs.organization_roles
(
    role_id integer,
    organization_id integer,
    role_name text,
    color_r integer,
    color_g integer,
    color_b integer,
    perm_admin boolean,
    perm_exec boolean,
    perm_submit boolean,
    perm_proj_submit boolean,
    perm_assign boolean,
    PRIMARY KEY (role_id)
);

CREATE TABLE orgs.organization_role_assignments
(
    membership_id integer,
    role_id integer
);

CREATE TABLE orgs.organization_articles
(
    article_id integer,
    organization_id integer,
    publish_date_utc timestamp without time zone,
    article_title text,
    article_url_title text,
    content_html text,
    summary text,
    cover_image_path text,
    is_announcement boolean,
    is_public boolean,
    PRIMARY KEY (article_id)
);

CREATE TABLE orgs.organization_assignments
(
    assignment_id integer,
    organization_id integer,
    title text,
    description text,
    due_date_utc timestamp without time zone,
    is_open boolean,
    PRIMARY KEY (assignment_id)
);

CREATE TABLE orgs.organization_assignment_components
(
    component_id integer,
    assignment_id integer,
    description text,
    is_required boolean,
    is_file_submission boolean,
    PRIMARY KEY (component_id)
);

CREATE TABLE orgs.organization_assignment_allocations
(
    allocation_id integer,
    assignment_id integer,
    team_id integer,
    PRIMARY KEY (allocation_id)
);

CREATE TABLE orgs.organization_assignment_submissions
(
    submission_id integer,
    allocation_id integer,
    component_id integer,
    content_string text,
    PRIMARY KEY (submission_id)
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