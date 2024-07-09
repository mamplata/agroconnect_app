// admin.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded.');

    // Check if user is logged in
    if (!localStorage.getItem('isLoggedIn') || localStorage.getItem('isLoggedIn') !== 'true') {
        console.log('User not logged in. Redirecting to login page...');
        redirectToLogin();
    } else {
        // User is logged in, check if user is admin
        var user = JSON.parse(localStorage.getItem('user'));

        if (!user || user.role !== 'admin') {
            redirectToLogin();
        } else {
            // Add further admin page initialization logic here
        }
    }
});

function redirectToLogin() {
    console.error('Redirecting to login page...');
    window.location.href = '/management/login';
}
