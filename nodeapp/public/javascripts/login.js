$(document).ready(() => {

    // Removes error on typing
    $("form input").keydown((e) => {
        $("#login-error-text").css("opacity", "0");
        $(".login-field").removeClass("login-field-error");
    })

    // Validates form submission
    $("form").submit((e) => {
        // Cancels event
        e.preventDefault();

        // Sends ajax with form data to check if login is correct
        $.ajax("/ajax/logincheck", {
            type: 'POST',
            data: {email: $("#login-email-field").val(), password: $("#login-password-field").val()},
            // Callback
            success: (reply) => {
                if (!!parseInt(reply)) {
                    location.href = "/dashboard";
                } else {
                    // Displays error visuals
                    $("#login-error-text").css("opacity", "1");
                    $(".login-field").addClass("login-field-error");
                }
            },
            async: true
        });
    });

});
