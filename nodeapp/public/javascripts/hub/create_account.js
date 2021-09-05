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
        e.preventDefault();

        $.post("/ajax/createaccountcheck", {formData: JSON.stringify($("#cracc-form").serializeArray())}, 
        (res) => {
            if (!!res.is_session_expired) {
                // Refreshes page
                location.reload();
            } else if (res.is_error) {
                // Displays errors
                display_errors(res);
            } else {
                // Redirect back to login flow
                location.href = "/login";
            }
        });
    });

});

function display_errors(res) {
    // Email field
    if ("email" in res && !res.email) {
        // Shows error
        $("#cracc-error-email").css("display", "block");
        $("#cracc-email-field").addClass("login-field-error");
    } else {
        // Hides error
        $("#cracc-error-email").css("display", "none");
        $("#cracc-email-field").removeClass("login-field-error");
    }
    
    // Display field
    if ("display_name" in res && !res.display_name) {
        $("#cracc-error-display").css("display", "block");
        $("#cracc-display-name-field").addClass("login-field-error");
    } else {
        $("#cracc-error-display").css("display", "none");
        $("#cracc-dislay-name-field").removeClass("login-field-error");
    }
    
    // Password field
    if ("password" in res && !res.password) {
        $("#cracc-error-pass").css("display", "block");
        $("#cracc-password-field").addClass("login-field-error");
    } else {
        $("#cracc-error-pass").css("display", "none");
        $("#cracc-password-field").removeClass("login-field-error");
    }
    
    // Confirm password field
    if ("confirm_password" in res && !res.confirm_password) {
        $("#cracc-error-confirm").css("display", "block");
        $("#cracc-confirm-password-field").addClass("login-field-error");
    } else {
        $("#cracc-error-confirm").css("display", "none");
        $("#cracc-confirm-password-field").removeClass("login-field-error");
    }
};

