$(document).ready(function() {
  // Function to initialize the manage users view
  function initializeManageUsersView() {
    $('#main-content').html(`
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Manage Users</h1>
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text border-0 bg-transparent"><i class="fas fa-search"></i></span>
          </div>
          <input placeholder="Search username..." type="text" class="form-control rounded-pill" id="search" name="search">
        </div>
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
             <input type="hidden" class="form-control" id="userId" name="userId">
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
            <button id="editBtn" class="btn btn-warning" style="margin-right: 10px;" disabled>Edit</button>
            <button id="deleteBtn" class="btn btn-danger" disabled>Delete</button>
            <div id="delete"></div>
            <div id="edit"></div>
          </div>
          <table id="userTable" class="table table-custom text-center">
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

    var selectedRow = null;
    var pageSize = 5;
    var currentPage = 1;
    var user = null;

    async function displayUsers(username = null) {

      // Simulate a delay of 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      $('#userTableBody').empty();
    
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = startIndex + pageSize;
      if (username) {
        // Display a single user if username is provided
          const foundUsers = searchUser(username);
          if (foundUsers.length > 0) {
            foundUsers.forEach(user => {
              $('#userTableBody').append(`
                <tr data-index=${user.userId}>
                  <td style="display: none;">${user.userId}</td>
                  <td>${user.firstName}</td>
                  <td>${user.lastName}</td>
                  <td>${user.username}</td>
                  <td>${user.role}</td>
                </tr>
              `);
            });
          } else {
            // Handle case where username is not provided
            $('#userTableBody').append(`
              <tr>
                <td colspan="4">User not found!</td>
              </tr>
            `)
          }
      } else {
        // Display paginated users if no username is provided
        for (var i = startIndex; i < endIndex; i++) {
          if (i >= users.length) {
            break;
          }
          var user = users[i];
          $('#userTableBody').append(`
            <tr data-index=${user.userId}>
              <td style="display: none;">${user.userId}</td>
              <td>${user.firstName}</td>
              <td>${user.lastName}</td>
              <td>${user.username}</td>
              <td>${user.role}</td>
            </tr>
          `);
        }
      }
    }
    

    // Display initial users
    displayUsers();

    $('#search').change(function() {
      let username = $('#search').val();
      displayUsers(username);
    });

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
    $('#submitBtn').click(function(event) {
      event.preventDefault();

      var userId = Number($('#userId').val());
      var firstName = $('#firstName').val();
      var lastName = $('#lastName').val();
      var username = $('#username').val();
      var role = $('#role').val();
      var password = $('#password').val();
      if (selectedRow !== null) {
        // Update existing user
        console.log(userId);
        let user = new User(userId, firstName, lastName, username, role);
        user.updateUser(user);
        selectedRow = null;
        $('#submitBtn').text('Add User');
        $('#cancelBtn').hide(); 
        $('#password').attr('placeholder', 'Password');
        $('#password').attr('required', 'required');
        resetFields();
      } else {
        let user = new User(0, firstName, lastName, username, role, password);
        user.createUser(user);
      }

      // Clear form fields after submission
      $('#userForm')[0].reset();
      selectedRow = null;
      $('#userTableBody tr').removeClass('selected-row');
      getUser();
      displayUsers();
    });

    function resetFields() {
      // Reset UI states
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
      selectedRow = null;
      $('#userTableBody tr').removeClass('selected-row');
    }

    $('#editBtn').click(function() { 
        // Open the delete modal
        $('#editModal').modal('show');

        // Edit button click handler
        $('#confirmEditBtn').click(function() {
          $('#editModal').modal('hide');
          $('#cancelBtn').show();
          $('#password').attr('placeholder', 'Password (optional)');
          $('#password').removeAttr('required');
          $('#userId').val(user.userId);
          $('#firstName').val(user.firstName);
          $('#lastName').val(user.lastName);
          $('#username').val(user.username);
          $('#submitBtn').text('Update User');
        });

        $('#cancelEdit').click(function() {
          resetFields();
        });
    });

    // Cancel button click handler
    $('#cancelBtn').click(function() {
      var confirmation = confirm('Are you sure you want to cancel editing?');
      if (confirmation) {
        selectedRow = null;
        $('#userForm')[0].reset();
        $('#submitBtn').text('Add User');
        $('#cancelBtn').hide();
        $('#password').attr('placeholder', 'Password');
        $('#password').attr('required', 'required');
        $('#userTableBody tr').removeClass('selected-row');
      }
    });

  // Delete button click handler
  $('#deleteBtn').click(function() {
    // Open the delete modal
    $('#deleteModal').modal('show');

    // Click handler for modal's delete button
    $('#confirmDeleteBtn').click(function() {
      // Close the modal
      $('#deleteModal').modal('hide');
        userToDelete = new User();
        userToDelete.removeUser(user.userId);
        displayUsers();
        resetFields();
      });

    $('#cancelDelete').click(function() {
      resetFields();
    });
  });

// Row click handler (for selecting rows)
$('#userTableBody').on('click', 'tr', function() {
  var $this = $(this);
  var userId = $this.data('index');
  user = users.find(u => u.userId === userId);
  selectedRow = userId;
  // Highlight selected row
  if (selectedRow !== null) {
  $('#userTableBody tr').removeClass('selected-row');
  $('#userTableBody tr').filter(function() {
    return parseInt($(this).find('td:eq(0)').text(), 10) === selectedRow;
  }).addClass('selected-row');
  $('#editBtn').prop('disabled', false);
  if (user.role !== 'admin') {
    $('#deleteBtn').prop('disabled', false);
  } else {
    $('#deleteBtn').prop('disabled', true);
  }
} else {
  $('#userTableBody tr').removeClass('selected-row');
}

});

}
  // Initialize manage users view when document is ready
  initializeManageUsersView();
  createDeleteModal();
  createEditModal();
});
