CREATE TABLE "users" (
	"user_id" INTEGER PRIMARY KEY,
    "user_name" TEXT,
    "user_profile_path" TEXT
);

CREATE TABLE "years" (
	"year_id" INTEGER PRIMARY KEY,
    "year_name" TEXT
);

CREATE TABLE "year_member_links" (
	"user_id" INTEGER,
    "year_id" INTEGER,
    "team_id" INTEGER,
    "position" TEXT
);

CREATE TABLE "award_winners" (
    "user_id" INTEGER,
    "award_id" INTEGER,
    "year_id" INTEGER
);

CREATE TABLE "teams" (
    "team_id" INTEGER PRIMARY KEY,
    "year_id" INTEGER,
    "team_name" TEXT,
    "team_letter" TEXT
);

CREATE TABLE "awards" (
    "award_id" INTEGER PRIMARY KEY,
    "award_name" TEXT,
    "award_image_path" TEXT
);

