// This script makes sure that the main-container div extends exactly 
// enough for the footer to align with the bottom.
// This is only needed if the page contents dont extend the footer themselves

function onResize () {
    // Calculates height of page content
    let content_height = 0;

    // For each body child, adds the inner height (with padding) and the margins to the height count
    $("body").children().map((i, itm) => {
        element_height = parseInt($(itm).css("margin-top")) + parseInt($(itm).css("margin-bottom")) + $(itm).innerHeight();
        
        console.log(itm.className);
        console.log(itm.id);
        console.log(element_height);
        
        content_height += element_height;
    });
    console.log("-----------------------")

    // Calculates pixels from the bottom of the screen
    let pixels_till_bottom = $(window).height() - content_height;
    
    // If there is space to the bottom of the screen, shift the footer to the bottom
    if (pixels_till_bottom > 0) {
        $("#footer").css("top", pixels_till_bottom.toString() + "px");
    }
}

$(window).on("load", () => {
    // Call the function again once the page has loaded (in case it wasnt done right)
    onResize();
    // Readjust on window resize
    $(window).on("resize", onResize);
})