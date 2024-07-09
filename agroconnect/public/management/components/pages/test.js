import User from '../classes/User.js'; // Adjust the path as per your project structure

$(document).ready(function() {
  // Function to initialize the manage users view
  function initializeManageUsersView() {
    $('#main-content').html(`
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Manage Users</h1>
      </div>
      <div class="row d-flex justify-content-between align-items-center mt-5">
        <div class="col-md-4">
          <form id="userForm">
            <div class="mb-3">
              <input placeholder="First Name" type="text" class="form-control" id="firstName" name="firstName" required>
            </div>
            <div class="mb-3">
              <input placeholder="Last Name" type="text" class="form-control" id="lastName" name="lastName" required>
            </div>
            <div class="mb-3">
              <label for="role" class="form-label">Role: </label>
              <select class="form-select" id="role" name="role" required>
                <option value="admin">Admin</option>
                <option value="agriculturist">Agriculturist</option>
              </select>
            </div>
            <div class="mb-3">
              <input placeholder="Username" type="text" class="form-control" id="username" name="username" required>
            </div>
            <div class="mb-3">
              <input placeholder="Password" type="password" class="form-control" id="password" name="password" required>
            </div>
            <button type="button" class="btn btn-custom" id="submitBtn">Add User</button>
            <button type="button" class="btn btn-custom mt-2" id="cancelBtn" style="display: none;">Cancel</button>
          </form>
        </div>
        <div class="col-md-7">
          <div class="d-flex justify-content-center justify-content-md-end flex-wrap flex-md-nowrap align-items-center mb-2">
            <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;">Edit</button>
            <button id="deleteBtn" class="btn btn-danger">Delete</button>
          </div>
          <table id="userTable" class="table table-custom text-center tablesorter">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">First Name</th>
                <th scope="col">Last Name</th>
                <th scope="col">Username</th>
                <th scope="col">Role</th>
              </tr>
            </thead>
            <tbody id="userTableBody">
              <!-- Table rows will be dynamically added here -->
            </tbody>
          </table>
          <div class="text-right">
            <button id="prevBtn" class="btn btn-green mr-2">Previous</button>
            <button id="nextBtn" class="btn btn-green">Next</button>
          </div>
        </div>
      </div>
    `);

    // Initialize tablesorter
    $("#userTable").tablesorter({
      theme: 'bootstrap',
      headerTemplate: '{content} {icon}',
      widgets: ['storage'],
      widgetOptions: {
        storage_key: 'tablesorter-users',
        storage_storeHeaders: true,
        storage_storeSort: true,
        storage_group: 'tablesorter',
      }
    });

    var users = [];
    var selectedRow = null;
    var pageSize = 5;
    var currentPage = 1;

    // Function to display users in the table
    function displayUsers() {
      $('#userTableBody').empty();

      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = startIndex + pageSize;

      for (var i = startIndex; i < endIndex; i++) {
        if (i >= users.length) {
          break;
        }
        var user = users[i];
        $('#userTableBody').append(`
          <tr data-index="${i}">
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
          </tr>
        `);
      }

      // Update tablesorter
      $("#userTable").trigger('update');
    }

    // Generate sample users
    for (var i = 0; i < 10; i++) {
      var user = {
        firstName: `User${i+1}`,
        lastName: `Last${i+1}`,
        username: `user${i+1}`,
        role: (i % 2 === 0) ? 'admin' : 'agriculturist'
      };
      users.push(user);
    }

    // Display initial users
    displayUsers();

    // Pagination: Previous button click handler
    $('#prevBtn').click(function() {
      if (currentPage > 1) {
        currentPage--;
        displayUsers();
      }
    });

    // Pagination: Next button click handler
    $('#nextBtn').click(function() {
      var totalPages = Math.ceil(users.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        displayUsers();
      }
    });

    // Form submission handler (Add or Update user)
    $('#userForm').submit(function(event) {
      event.preventDefault();

      var firstName = $('#firstName').val();
      var lastName = $('#lastName').val();
      var username = $('#username').val();
      var role = $('#role').val();

      if (selectedRow !== null) {
        // Update existing user
        users[selectedRow].firstName = firstName;
        users[selectedRow].lastName = lastName;
        users[selectedRow].username = username;
        users[selectedRow].role = role;
        selectedRow = null;
        $('#submitBtn').text('Add User');
        $('#cancelBtn').hide(); 
      } else {
        // Add new user
        users.push({
          firstName: firstName,
          lastName: lastName,
          username: username,
          role: role
        });
      }

      // Clear form fields after submission
      $('#userForm')[0].reset();
      displayUsers();
    });

    // Edit button click handler
    $('#editBtn').click(function() {
      if ($('#editBtn').hasClass('active')) {
        var confirmation = confirm('Are you sure you want to cancel edit mode?');
        if (confirmation) {
          toggleRowSelectionMode(false);
          $('#cancelBtn').hide();
        }
      } else {
        toggleRowSelectionMode(true);
        $('#cancelBtn').show();
      }
    });

    // Cancel button click handler
    $('#cancelBtn').click(function() {
      var confirmation = confirm('Are you sure you want to cancel editing?');
      if (confirmation) {
        selectedRow = null;
        $('#userForm')[0].reset();
        $('#submitBtn').text('Add User');
        $('#cancelBtn').hide();
        toggleRowSelectionMode(false);
      }
    });

   // Delete button click handler
  $('#deleteBtn').click(function() {
    if ($('#deleteBtn').hasClass('active')) {
      var confirmation = confirm('Are you sure you want to cancel delete mode?');
      if (confirmation) {
        toggleRowSelectionMode(false);
      }
    } else {
      toggleRowSelectionMode(true, true);
    }
  });

// Row click handler (for selecting rows)
$('#userTableBody').on('click', 'tr', function() {
  var $this = $(this);

  if ($('#deleteBtn').hasClass('active')) {
    var index = $this.data('index');
    var user = users[index];
    selectedRow = index;
    $('#userTableBody tr').eq(selectedRow).addClass('selected-row');

    // Delayed confirmation dialog
    setTimeout(function() {
      if (selectedRow !== null) {
        var confirmation = confirm('Are you sure you want to delete this user?');
        if (confirmation) {
          users.splice(index, 1);
          displayUsers();
        }
        selectedRow = null; // Reset selected row
        $('#userTableBody tr').removeClass('selected-row');
      }
    }, 100); // 3000 milliseconds = 3 seconds delay

  } else if ($('#editBtn').hasClass('active')) {
    var index = $this.data('index');
    var user = users[index];
    selectedRow = index;

    $('#firstName').val(user.firstName);
    $('#lastName').val(user.lastName);
    $('#username').val(user.username);
    $('#role').val(user.role);
    $('#submitBtn').text('Update User');
  }

  toggleRowSelectionMode(false);
});
    // Function to toggle row selection mode
    function toggleRowSelectionMode(enable, isDelete = false) {
      if (enable) {
        $('#editBtn').addClass('active');
        $('#deleteBtn').toggleClass('active', isDelete);
        $('#userTableBody tr').css('cursor', 'pointer');
      } else {
        $('#editBtn').removeClass('active');
        $('#deleteBtn').removeClass('active');
        $('#userTableBody tr').css('cursor', 'default');
      }

      // Highlight selected row
      if (selectedRow !== null) {
        $('#userTableBody tr').removeClass('selected-row');
        $('#userTableBody tr').eq(selectedRow).addClass('selected-row');
      } else {
        $('#userTableBody tr').removeClass('selected-row');
      }
    }
  }

  // Initialize manage users view when document is ready
  initializeManageUsersView();
});
