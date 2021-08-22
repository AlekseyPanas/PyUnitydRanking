$(document).ready(() => {
    let sliding = false;
    let sliding_interval = null;
    // EJS INJECTED VARIABLES:
    // games_arr = JSON object of all games
    // games_per_page = # Games that should be allocated per page
    let current_games = games_arr;
    
    // Current page on the game card display (Each page holds "games_per_page" # of games)
    let page = 1;

    $("#proj-search-bar").on("input", (e) => {
        let searchString = $("#proj-search-bar").val(); //+ String.fromCharCode(e.keyCode)).toLowerCase()

        // If the sliding interval isn't already running
        if (!(!!sliding_interval)) {
            // Creates interval checks for sliding
            sliding_interval = setInterval(() => {
                if (!sliding) {
                    // disables any page changes
                    sliding = true;
                    clearInterval(sliding_interval);
                    sliding_interval = null;

                    if (!!searchString) {
                        // Alters current games based on all games
                        current_games = games_arr.filter((item) => {
                            return item.title.toLowerCase().includes(searchString.toLowerCase());
                        });
                    } else {
                        current_games = games_arr;
                    }

                    // Sets page back to 1
                    page = 1;

                    repopulate_page(page, games_per_page, current_games, true);

                    sliding = false;
                }
            }, 50);
        }
    });

    // Move page right
    $("#proj-arrow-right").on("click", (e) => {
        if (!sliding && (page*games_per_page) < current_games.length) {
            sliding = true;
            // Slides game page, adds page index, rerenders game cards, resets sliding
            $(".game-container").animate({"right": "100vw"}).promise().done(() => {
                setTimeout(() => {
                    page += 1;
                    repopulate_page(page, games_per_page, current_games, true);
                    sliding = false;
                }, 200);    
            });
        }
    });


    // Move page left
    $("#proj-arrow-left").on("click", (e) => {
        if (!sliding && page > 1) {
            sliding = true;
            // Slides game page, subtracts page index, rerenders game cards, resets sliding
            $(".game-container").animate({"left": "100vw"}, 300).promise().done(() => {
                setTimeout(() => {
                    page -= 1;
                    repopulate_page(page, games_per_page, current_games, true);
                    sliding = false;
                }, 200);
            });
        }
    });
});

function repopulate_page(page, games_per_page, current_games, reanimate=false) {
    let games_on_this_page = current_games.slice((page-1)*games_per_page, page*games_per_page);
    
    console.log(page);
    console.log(games_per_page);
    console.log(current_games);
    console.log(games_on_this_page);

    $(".game-outer-container").each((idx, element) => {
        if (idx < games_on_this_page.length) {
            let cur_game = games_on_this_page[idx]

            // Shows this element
            $(element).css("display", "block");

            // Changes element data
            $(element).find(".game-title").html(cur_game.title);
            $(element).find(".game-author").html(cur_game.author);
            $(element).find(".game-release-year").html(cur_game.release_year);
            $(element).find(".game-description").html(cur_game.desc);
            $(element).find(".game-img").attr("src", cur_game.cover_img_path);
            // Daunting Button Enabling/Disabling
            if (!!cur_game.github_link) {
                $(element).find(".github_link").css("display", "inline");
            } else {$(element).find(".github_link").css("display", "none");}
            if (!!cur_game.other_link) {
                $(element).find(".other_link").css("display", "inline");
                $(element).find(".other_link").css("transition-delay", 
                ((!!cur_game.github_link) * 0.1).toString() + 's');
            } else {$(element).find(".other_link").css("display", "none");}
            if (!!cur_game.roblox_link) {
                $(element).find(".roblox_link").css("display", "inline");
                $(element).find(".roblox_link").css("transition-delay", 
                ((!!cur_game.github_link + !!cur_game.other_link) * 0.1).toString() + 's');
            } else {$(element).find(".roblox_link").css("display", "none");}
            if (!!cur_game.universal_download) {
                $(element).find(".universal_download").css("display", "inline");
                $(element).find(".universal_download").css("transition-delay", 
                ((!!cur_game.github_link + !!cur_game.other_link + !!cur_game.roblox_link) * 0.1).toString() + 's');
            } else {$(element).find(".universal_download").css("display", "none");}
            if (!!cur_game.windows_download) {
                $(element).find(".windows_download").css("display", "inline");
                $(element).find(".windows_download").css("transition-delay", 
                ((!!cur_game.github_link + !!cur_game.other_link + !!cur_game.roblox_link + !!cur_game.universal_download) * 0.1).toString() + 's');
            } else {$(element).find(".windows_download").css("display", "none");}
            if (!!cur_game.mac_download) {
                $(element).find(".mac_download").css("display", "inline");
                $(element).find(".mac_download").css("transition-delay", 
                ((!!cur_game.github_link + !!cur_game.other_link + !!cur_game.roblox_link + !!cur_game.universal_download + !!cur_game.windows_download) * 0.1).toString() + 's');
            } else {$(element).find(".mac_download").css("display", "none");}

            if (reanimate) {
                // Resets position
                $(element).find(".game-container").css("left", "unset");
                $(element).find(".game-container").css("right", "unset");   

                // Toggles animation
                var el = $(element);
        
                //Prepend the clone & then remove the original element
                el.before( el.clone(true) ).remove();
            }

        } else {
            // If the remaining items on this page are not needed, they are hidden away
            $(element).css("display", "none");
        }
    });

    // Footer Fix
    onResize();
}
