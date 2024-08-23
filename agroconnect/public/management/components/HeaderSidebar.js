$(document).ready(function() {

    function requestCsrfCookie() {
        return $.ajax({
            url: '/api/csrf-cookie',
            type: 'GET',
            xhrFields: {
                withCredentials: true // Ensure cookies are sent with the request
            }
        });
    }

    // Function to get CSRF token from a meta tag
    function getCsrfToken() {
        return $('meta[name="csrf-token"]').attr('content');
    }
    

     // Function to check token validity
     function checkToken() {
        return $.ajax({
            url: '/api/check-token',
            type: 'GET',
            xhrFields: {
                withCredentials: true, // Ensure cookies are sent with the request
            },
            headers: {
                'X-CSRF-TOKEN': getCsrfToken() // Include CSRF token if required
            }
        }).done(function(response) {
            console.log('Response:', response.message);
            userId = response.userId;
            getUserName(); // Fetch the user name
        }).fail(function(xhr) {
            const errorResponse = xhr.responseJSON;
            console.error('Error:', errorResponse.message);
            if (errorResponse.token) {
                console.error('Token:', errorResponse.token);
            }
            window.location.href = '/index.html';
        });
    }

    requestCsrfCookie().done(function() {
        return checkToken();
    });

      // Function to get username based on userId
      function getUserName() {
        $.ajax({
            url: '/api/users/' + userId, // Fetch user by ID
            type: 'GET',
            xhrFields: {
                withCredentials: true, // Ensure cookies are sent with the request
            },
            headers: {
                'X-CSRF-TOKEN': getCsrfToken() // Include CSRF token if required
            },
            success: function(response) {
                console.log('User:', response.user);
                $('#username').text(response.user.name); // Set username to HTML element
            },
            error: function(xhr) {
                const errorResponse = xhr.responseJSON;
                console.error('Error:', errorResponse.message);
                if (errorResponse.token) {
                    console.error('Token:', errorResponse.token);
                }
            }
        });
    }

    // Set default hash to #dashboard if no hash is present
    if (!window.location.hash) {
        window.location.hash = '#dashboard';
    }

    // Function to load content from a JavaScript module file into main content area
    async function loadContent(url) {
        try {
            // Dynamically import the module
            const module = await import(url);

            // Assuming your module has a default export or named exports
            if (module.default) {
                module.default(); // Call the default export function if it exists
            }
        } catch (error) {
            console.error(`Failed to load module from ${url}:`, error);
        }
    }

    var user = JSON.parse(sessionStorage.getItem('user'));

    
    $('head').prepend(`
        <link rel="icon" href="../../../img/logo.png" type="image/png">   
    `);

    // Prepend header and sidebar structure to the body
    $('body').prepend(`
       <div class="wrapper">
            <!-- Header -->
            <div class="header">
                <header class="header d-flex justify-content-between align-items-center" style="background-color: #008000;">
                    <div class="header d-flex align-items-center p-2">
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

            <!-- Sidebar and Content Wrapper -->
            <div class="content-wrapper">
                <!-- Sidebar -->
                <nav class="sidebar">
                    <div>
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

                <!-- Main Content Area -->
                <main role="main" id="main-content" class="content ml-sm-auto col-lg-10 pr-4">
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
    async function loadDefaultContent() {
        const hash = window.location.hash;
        let modulePath;
    
        // Determine which module to load based on the URL hash
        switch (hash) {
            case '#dashboard':
                modulePath = '../components/pages/Dashboard.js';
                await loadContent(modulePath);
                setActiveLink('#dashboard-link');
                break;
            case '#manage-users':
                modulePath = '../components/pages/ManageUsers.js';
                await loadContent(modulePath);
                setActiveLink('#manage-users-link');
                break;
            case '#maintenance':
                modulePath = '../components/pages/Maintenance.js';
                await loadContent(modulePath);
                setActiveLink('#maintenance-link');
                break;
            case '#data-entries':
                modulePath = '../components/pages/DataEntries.js';
                await loadContent(modulePath);
                setActiveLink('#data-entries-link');
                break;
            case '#concerns':
                modulePath = '../components/pages/Concerns.js';
                await loadContent(modulePath);
                setActiveLink('#concerns-link');
                break;
            default:
                modulePath = '../components/pages/Dashboard.js';
                await loadContent(modulePath);
                setActiveLink('#dashboard-link');
                break;
        }
    }
    
    // Example function to set the active link
    function setActiveLink(selector) {
        // Remove active class from all links
        $('.nav-link').removeClass('active');
        // Add active class to the selected link
        $(selector).addClass('active');
    }
    
    // Call loadDefaultContent when the page loads
    $(document).ready(function() {
        loadDefaultContent();
    
        // Also handle hash change if user navigates using browser history
        $(window).on('hashchange', function() {
            loadDefaultContent();
        });
    });

    // Initialize sidebar based on user role
    initializeSidebar();

       // Logout button click event
       $('.logout a').on('click', function() {
        $.ajax({
            url: '/api/logout', // Route to handle logout
            type: 'POST',
            xhrFields: {
                withCredentials: true, // Ensure cookies are sent with the request
            },
            headers: {
                'X-CSRF-TOKEN': getCsrfToken() // Include CSRF token if required
            },
            success: function(response) {
                if (response.success) {
                    alert('You have been logged out.');
                    window.location.href = '/index.html'; // Redirect to login page
                } else {
                    alert('Logout failed: ' + response.message);
                }
            },
            error: function(xhr) {
                alert('Logout failed: ' + xhr.responseJSON.message);
            }
        });
    });
});