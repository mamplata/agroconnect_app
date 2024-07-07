$(document).ready(function() {
    // Setup CSRF token for all AJAX requests
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    // Check if already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        // Redirect based on role
        redirectBasedOnRole();
    }

    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        
        var username = $('#username').val();
        var password = $('#password').val();

        $.ajax({
            url: '/api/login', // Update this URL to match your Laravel route
            method: 'POST',
            data: {
                username: username,
                password: password
            },
            success: function(response) {
                // Store user data in sessionStorage upon successful login
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('user', JSON.stringify(response.user)); // Store user details

                $('#loginResult').html('<div class="alert alert-success">Login successful!</div>');
                
                // Redirect based on role
                redirectBasedOnRole();
            },
            error: function(xhr) {
                var error = xhr.responseJSON ? xhr.responseJSON.message : 'Login failed!';
                $('#loginResult').html('<div class="alert alert-danger">' + error + '</div>');
            }
        });
    });

    function redirectBasedOnRole() {
        var user = JSON.parse(sessionStorage.getItem('user'));
        if (user && user.role === 'admin') {
            window.location.href = '/management/admin'; // Redirect to admin page
        } else if (user && user.role === 'agriculturist') {
            window.location.href = '/management/agriculturist'; // Redirect to user page
        }
    }
});
