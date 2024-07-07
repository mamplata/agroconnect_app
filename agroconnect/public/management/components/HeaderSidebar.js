$(document).ready(function() {
    // Function to load content from a JavaScript file into main content area
    function loadContent(url) {
      $.getScript(url);
    }
  
    // Prepend header and sidebar structure to the body
    $('body').prepend(`
        <div class="container-fluid p-0">
            <header class="header d-flex justify-content-between align-items-center">
                <div class="header d-flex align-items-center">
                    <img src="../img/logo.png" alt="Logo" class="header-logo">
                    <h3 id="appName" class="pl-3">AgroConnect Cabuyao</h3>
                </div>
                <div class="pr-4 d-flex align-items-center">
                    <span class="username font-weight-bold">Your Username</span>
                    <span class="user-icon">
                        <i class="fas fa-user"></i>
                    </span>
                </div>
            </header>
        </div>
        <div class="container-fluid sidebar-container pl-0 d-flex justify-content-center">
            <nav class="sidebar" style="background-color: #2774E9; height: calc(100vh - 60px);"> <!-- 60px is the height of the header -->
                <!-- Sidebar content goes here -->
                <div class="sidebar-sticky">
                    <ul class="nav flex-column mt-4">
                        <li class="nav-item">
                            <a id="dashboard-link" class="nav-link active" href="#">
                                <i class="fas fa-tachometer-alt"></i>
                                Dashboard
                            </a>
                        </li>
                        <li class="nav-item mt-3">
                            <a id="manage-users-link" class="nav-link" href="#">
                                <i class="fas fa-users"></i>
                                Manage Users
                            </a>
                        </li>
                        <li class="nav-item mt-3">
                            <a id="maintenance-link" class="nav-link" href="#">
                                <i class="fas fa-wrench"></i>
                                Maintenance
                            </a>
                        </li>
                        <li class="nav-item mt-3">
                            <a id="data-entries-link" class="nav-link" href="#">
                                <i class="fas fa-database"></i>
                                Data Entries
                            </a>
                        </li>
                        <li class="nav-item mt-3">
                            <a id="concerns-link" class="nav-link" href="#">
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
                <!-- Main content area -->
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
  
    // Load default content (Dashboard) on page load
    loadContent("components/pages/Dashboard.js");
  
    // Handle sidebar link clicks to load corresponding content
    $('#dashboard-link').click(function(e) {
      e.preventDefault();
      loadContent("components/pages/Dashboard.js");
      $('#dashboard-link').addClass('active').siblings().removeClass('active');
    });
  
    $('#manage-users-link').click(function(e) {
      e.preventDefault();
      loadContent("components/pages/ManageUsers.js");
      $('#manage-users-link').addClass('active').siblings().removeClass('active');
    });
  
    $('#maintenance-link').click(function(e) {
      e.preventDefault();
      loadContent("components/pages/Maintenance.js");
      $('#maintenance-link').addClass('active').siblings().removeClass('active');
    });
  
    $('#data-entries-link').click(function(e) {
      e.preventDefault();
      loadContent("components/pages/DataEntries.js");
      $('#data-entries-link').addClass('active').siblings().removeClass('active');
    });
  
    $('#concerns-link').click(function(e) {
      e.preventDefault();
      loadContent("components/pages/Concerns.js");
      $('#concerns-link').addClass('active').siblings().removeClass('active');
    });
  
    $(document).ready(function() {
        // Simulating login and storing session data
        sessionStorage.setItem('isLoggedIn', 'true');
        var response = { user: { username: 'example_user' } };
        sessionStorage.setItem('user', JSON.stringify(response.user)); // Store user details
      
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
            // Optionally handle cancelation of logout
            alert("Logout canceled!");
          }
        });
      });      
  });
  