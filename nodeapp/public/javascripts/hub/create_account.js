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
            e.preventDefault();
        }
    });

});

function checkValid() {
    let valid = true;

    let name = $("#cracc-display-name-field").val();
    let pass = $("#cracc-password-field").val();
    let confirm_pass = $("#cracc-confirm-password-field").val();

    // Checks if display name is valid
    if (!name.match(/^[A-Za-z0-9_-]*$/)) {
        // Shows error
        $("#cracc-error-display").css("display", "block");

        $("#cracc-display-name-field").addClass("login-field-error");

        valid = false;
    } else {
        // Hide error
        $("#cracc-error-display").css("display", "none");

        $("#cracc-dislay-name-field").removeClass("login-field-error");
    }

    // Checks if password is good
    if (!pass.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)) {
        // Shows error
        $("#cracc-error-pass").css("display", "block");

        $("#cracc-password-field").addClass("login-field-error");

        valid = false;
    } else {
        // Hide error
        $("#cracc-error-pass").css("display", "none");

        $("#cracc-password-field").removeClass("login-field-error");
    }

    // Checks if passwords match
    if (!(pass == confirm_pass)) {
        // Shows error
        $("#cracc-error-confirm").css("display", "block");

        $("#cracc-confirm-password-field").addClass("login-field-error");

        valid = false;
    } else {
        // Hide error
        $("#cracc-error-confirm").css("display", "none");

        $("#cracc-confirm-password-field").removeClass("login-field-error");
    }

    return valid;
};

