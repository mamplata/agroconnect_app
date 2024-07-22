document.addEventListener('DOMContentLoaded', function() {
   

    // Check if user is logged in
    if (!sessionStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn') !== 'true') {
        console.log('User not logged in. Redirecting to login page...');
        redirectToLogin();
    } else {
        // User is logged in, check if user is admin
        var user = JSON.parse(sessionStorage.getItem('user'));
        console.log('Admin page loadedss.');
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
