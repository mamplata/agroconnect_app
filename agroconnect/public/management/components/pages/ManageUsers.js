$(document).ready(function() {
  $('#main-content').html(`
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
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
              <option value="user">User</option>
            </select>
          </div>
          <div class="mb-3">
            <input placeholder="Username" type="text" class="form-control" id="username" name="username" required>
          </div>
          <div class="mb-3">
            <input placeholder="Password" type="password" class="form-control" id="password" name="password" required>
          </div>
          <button type="submit" class="btn btn-custom">Add User</button>
        </form>
      </div>
      <div class="col-md-7">
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
      // Save the sort state in local storage
      storage_key: 'tablesorter-users',
      storage_storeHeaders: true,
      storage_storeSort: true,
      storage_group: 'tablesorter',
    }
  });

  $('#userForm').submit(function(event) {
    event.preventDefault();
    
    var firstName = $('#firstName').val();
    var lastName = $('#lastName').val();
    var username = $('#username').val();
    var role = $('#role').val();
    
    $('#userTableBody').append(`
      <tr>
        <td>${firstName}</td>
        <td>${lastName}</td>
        <td>${username}</td>
        <td>${role}</td>
      </tr>
    `);
    
    // Clear form fields after submission
    $('#userForm')[0].reset();

    // Update tablesorter
    $("#userTable").trigger('update');
  });

  var pageSize = 5;
  var currentPage = 1;

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
        <tr>
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

  var users = [];
  for (var i = 0; i < 10; i++) {
    var user = {
      firstName: `User${i+1}`,
      lastName: `Last${i+1}`,
      username: `user${i+1}`,
      role: (i % 2 === 0) ? 'admin' : 'user'
    };
    users.push(user);
  }

  displayUsers();

  $('#prevBtn').click(function() {
    if (currentPage > 1) {
      currentPage--;
      displayUsers();
    }
  });

  $('#nextBtn').click(function() {
    var totalPages = Math.ceil(users.length / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      displayUsers();
    }
  });
});
