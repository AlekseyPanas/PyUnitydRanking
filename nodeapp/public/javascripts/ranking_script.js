
$(document).ready(() => {
	// Resizes bg on resize of viewport
	$(window).resize(resize_bg);
	resize_bg();

	
});

// Resizes gradient bg to fit fullscreen
function resize_bg () {
	const desiredHeight =  "100% " + (($("#list-container").height() < $(window).height()) ? ($("#list-container").height() + 127) : $(window).height()) + "px";

	console.log(desiredHeight);

	$(".grad").css("background-size", desiredHeight);
}

