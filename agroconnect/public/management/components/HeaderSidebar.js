$(document).ready(function() {

    // Set default hash to #dashboard if no hash is present
    if (!window.location.hash) {
        window.location.hash = '#dashboard';
    }
    
    // Function to load content from a JavaScript file into main content area
    function loadContent(url) {
        $.getScript(url);
    }

    var user = JSON.parse(localStorage.getItem('user'));

    // Prepend header and sidebar structure to the body
    $('body').prepend(`
        <div class="container-fluid p-0">
            <header class="header d-flex justify-content-between align-items-center" style="background-color: #008000;">
                <div class="header d-flex align-items-center">
                    <img src="../img/logo.png" alt="Logo" class="header-logo">
                    <h3 id="appName" class="pl-3">AgroConnect Cabuyao</h3>
                </div>
                <div class="pr-4 d-flex align-items-center">
                    <span class="username font-weight-bold">${user.username}</span>
                    <span class="user-icon">
                        <i class="fas fa-user"></i>
                    </span>
                </div>
            </header>
        </div>
        <div class="container-fluid sidebar-container pl-0 d-flex justify-content-center">
            <nav class="sidebar" style="background-color: #2774E9; height: calc(100vh - 60px);"> <!-- 60px is the height of the header -->
                <div class="sidebar-sticky">
                    <ul class="nav flex-column mt-4">
                        <li class="nav-item">
                            <a id="dashboard-link" class="nav-link active" href="#dashboard">
                                <i class="fas fa-tachometer-alt"></i>
                                Dashboard
                            </a>
                        </li>
                        <li class="nav-item mt-3">
                            <a id="manage-users-link" class="nav-link" href="#manage-users">
                                <i class="fas fa-users"></i>
                                Manage Users
                            </a>
                        </li>
                        <li class="nav-item mt-3">
                            <a id="maintenance-link" class="nav-link" href="#maintenance">
                                <i class="fas fa-wrench"></i>
                                Maintenance
                            </a>
                        </li>
                        <li class="nav-item mt-3">
                            <a id="data-entries-link" class="nav-link" href="#data-entries">
                                <i class="fas fa-database"></i>
                                Data Entries
                            </a>
                        </li>
                        <li class="nav-item mt-3">
                            <a id="concerns-link" class="nav-link" href="#concerns">
                                <i class="fas fa-exclamation-triangle"></i>
                                Concerns
                            </a>
                        </li>
                    </ul>
                    <ul class="nav flex-column logout">
                        <li class="nav-item mt-auto">
                            <a class="nav-link" href="#">
                                <i class="fas fa-sign-out-alt"></i>
                                Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
            <main role="main" id="main-content" class="col-md-9 ml-sm-auto col-lg-10 px-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Main Content</h1>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <p>Content area below the header and sidebar.</p>
                    </div>
                </div>
            </main>
        </div>
    `);

    // Load default content based on URL hash
    function loadDefaultContent() {
        const hash = window.location.hash;
        switch (hash) {
            case '#dashboard':
                loadContent("components/pages/Dashboard.js");
                setActiveLink('#dashboard-link');
                break;
            case '#manage-users':
                loadContent("components/pages/ManageUsers.js");
                setActiveLink('#manage-users-link');
                break;
            case '#maintenance':
                loadContent("components/pages/Maintenance.js");
                setActiveLink('#maintenance-link');
                break;
            case '#data-entries':
                loadContent("components/pages/DataEntries.js");
                setActiveLink('#data-entries-link');
                break;
            case '#concerns':
                loadContent("components/pages/Concerns.js");
                setActiveLink('#concerns-link');
                break;
            default:
                loadContent("components/pages/Dashboard.js");
                setActiveLink('#dashboard-link');
                break;
        }
    }

    // Set active link
    function setActiveLink(selector) {
        $('.nav-link').removeClass('active');
        $(selector).addClass('active');
    }

    // Handle sidebar link clicks to load corresponding content and update URL
    $('.nav-link').click(function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        window.location.hash = target;
        loadDefaultContent();
    });

    // Load content based on the current hash
    loadDefaultContent();

    // Handle hash change events
    $(window).on('hashchange', function() {
        loadDefaultContent();
    });


    // Example logout link handling
    $('.logout a').click(function(e) {
        e.preventDefault();
        // Ask for confirmation before logging out
        if (confirm("Are you sure you want to log out?")) {
            // Clear session storage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            // Redirect to login page
            window.location.href = '/management/login';
        } else {
            // Optionally handle cancellation of logout
            alert("Logout canceled!");
        }
    });
});
