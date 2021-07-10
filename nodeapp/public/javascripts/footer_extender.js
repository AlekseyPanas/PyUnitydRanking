// This script makes sure that the main-container div extends exactly 
// enough for the footer to align with the bottom.
// This is only needed if the page contents dont extend the footer themselves

$(document).ready(() => {

    let main_div_height;
    let pixels_till_bottom = $(window).height() - $("body").height();

    if (pixels_till_bottom > 0) {
        main_div_height = $("#main-container").height() + pixels_till_bottom;
    }

    if (!!main_div_height) {
        let height_val = main_div_height.toString() + "px";
        $("#main-container").css("height", main_div_height.toString() + "px");
    }
})