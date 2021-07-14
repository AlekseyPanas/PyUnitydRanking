$(document).ready(() => {
    setEarliestID();    

    $("#show-more").on("click", () => {
        // Replaces button with loading icon
        $("#show-more").css("display", "none");
        $("#load-icon").css("display", "unset");
        
        // Runs ajax to grab next 5 or less articles
        $.post("/ajax/get-next-articles-batch", {
            earliest_article_ID: localStorage.getItem("earliest_article_ID")
        }, (data) => {
            // Display end text and hide button if no more articles left to show
            if (!data.length) {
                $("#show-more").css("display", "none");
                $("#load-icon").css("display", "none");
                $("#youve-hit-bottom").css("display", "unset");
            } else {
                // Loads new articles into DOM
                data.forEach((itm) => {console.log(itm.cover_image_path);$(".article-cover-container").last().after(`<div id="` +  itm.article_id + `" class="article-cover-container"> 
                            <div class="article-cover-text-container">
                                <h2 class="article-cover-title"> <a href="/article/` + itm.article_url_title + `">` + itm.article_title + `</a> </h2>
                                <p class="article-cover-description">` + itm.summary + `</p>
                            </div>
                            <div class="article-cover-image-container">` +
                        (!!itm.cover_image_path ? `<img class="article-cover-image" src="` + itm.cover_image_path + `"> </img>` : "") + 
                    `</div>
                </div>`)})

                // Resets new ID
                setEarliestID();

                // Brings back button
                $("#show-more").css("display", "unset");
                $("#load-icon").css("display", "none");
            }
        })
    });
});

function setEarliestID () {
    // Sets "earliest_article_ID" by finding smallest ID among article containers
    // (Backend sets article container ID to the article's unique ID)
    let smallestID;
    $(".article-cover-container").each((idx, obj) => {
        let curID = $(obj)[0].id;
        // If variable not init, or smaller ID found, set smallestID to current ID
        if (!(!!smallestID) || curID  < smallestID) {
            smallestID = curID;
        }
    });

    localStorage.setItem("earliest_article_ID", smallestID)
}