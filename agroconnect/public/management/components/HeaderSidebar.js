$(document).ready(function() {

    // Set default hash to #dashboard if no hash is present
    if (!window.location.hash) {
        window.location.hash = '#dashboard';
    }

    // Function to load content from a JavaScript file into main content area
    function loadContent(url) {
        $.getScript(url);
    }

    var user = JSON.parse(sessionStorage.getItem('user'));

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
                    <ul class="nav flex-column mt-4" id="sidebar-links">
                        <!-- Links will be dynamically added here -->
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
            <main role="main" id="main-content" class="ml-sm-auto col-lg-10 pr-4 pl-0">
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

    // Determine which sidebar links to show based on user role
    function initializeSidebar() {
        var links = [
            { id: 'dashboard-link', href: '#dashboard', icon: 'fas fa-tachometer-alt', text: 'Dashboard' },
            { id: 'manage-users-link', href: '#manage-users', icon: 'fas fa-users', text: 'Manage Users' },
            { id: 'maintenance-link', href: '#maintenance', icon: 'fas fa-wrench', text: 'Maintenance' },
            { id: 'data-entries-link', href: '#data-entries', icon: 'fas fa-database', text: 'Data Entries' },
            { id: 'concerns-link', href: '#concerns', icon: 'fas fa-exclamation-triangle', text: 'Concerns' }
        ];

        // Filter links based on user role
        if (user.role === 'admin') {
            links.forEach(link => {
                $('#sidebar-links').append(`
                    <li class="nav-item mt-3">
                        <a id="${link.id}" class="nav-link" href="${link.href}">
                            <i class="${link.icon}"></i>
                            ${link.text}
                        </a>
                    </li>
                `);
            });
        } else if (user.role === 'agriculturist') {
            const agriculturistLinks = [
                links[0], // Dashboard
                links[2], // Maintenance
                links[4]  // Concerns
            ];
            agriculturistLinks.forEach(link => {
                $('#sidebar-links').append(`
                    <li class="nav-item mt-3">
                        <a id="${link.id}" class="nav-link" href="${link.href}">
                            <i class="${link.icon}"></i>
                            ${link.text}
                        </a>
                    </li>
                `);
            });
        }
    }

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
    $(document).on('click', '.nav-link', function(e) {
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

    // Initialize sidebar based on user role
    initializeSidebar();

    // Example logout link handling
    $('.logout a').click(function(e) {
        e.preventDefault();
        // Ask for confirmation before logging out
        if (confirm("Are you sure you want to log out?")) {
            // Clear session storage
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('user');
            // Redirect to login page
            window.location.href = '/management/login';
        } else {
            // Optionally handle cancellation of logout
            alert("Logout canceled!");
        }
    });
});
