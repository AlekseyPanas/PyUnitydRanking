$(document).ready(() => {
	console.log(selected_year);
	// Resizes bg on resize of viewport
	$(window).resize(resize_bg);
	resize_bg();

	// Selects tab when clicked
	$(".year-tab-button").click((event) => {
		if (!($(event.target).attr("id") === selected_year.year_id)) {
			location.href = "/ranking/" + $(event.target).attr("id");
		}
	})
});

// Resizes gradient bg to fit fullscreen
function resize_bg () {
	const desiredHeight =  "100% " + (($("#list-container").height() < $(window).height()) ? ($("#list-container").height() + 127) : $(window).height()) + "px";

	console.log(desiredHeight);

	$(".grad").css("background-size", desiredHeight);
}

