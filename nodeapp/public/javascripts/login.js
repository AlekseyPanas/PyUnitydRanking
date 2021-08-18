$(document).ready(() => {

    // Prevents enter key form submission
    $("form input").keydown((e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
            return false;
        }
    })

    // Validates form submission
    $("form").submit((e) => {
        if (!checkValid()) {
            
            // Displays error visuals
            $("#login-error-text").css("opacity", "1");
            $(".login-field").addClass("login-field-error");

            e.preventDefault();
        }
    });

});

function checkValid() {

    // Sends ajax with form data to check if login is correct
    return false;
};

