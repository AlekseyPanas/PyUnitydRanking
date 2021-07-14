$(document).ready(() => {

    $("#show-more").on("click", () => {
        console.log("test");
        
        // Replaces button with loading icon
        $("#show-more").css("display", "none");
        $("#load-icon").css("display", "unset");

        // Runs ajax to grab next 5 or less articles
        $.get("/", {}, (data) => {
            // Brings back button
            $("#show-more").css("display", "unset");
            $("#load-icon").css("display", "none");
        })
    });
});