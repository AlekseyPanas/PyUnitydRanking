
$(window).on("load", () => {
//	console.log("background-size", "100% " + (($("#list-container").height() - 72) + "px"));
	//$(".grad").css("background-size", "100% " + (($("#list-container").height() + 127) + "px"));
	const desiredHeight =  "100% " + (($("#list-container").height() < $(window).height()) ? ($("#list-container").height() + 127) : $(window).height()) + "px";

	console.log(desiredHeight);

	$(".grad").css("background-size", desiredHeight);
});



