$(document).ready(function() {
  // Replace #main-content with your actual content container ID or class
  $('#main-content').html(`
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h3">Manage Users</h1>
    </div>
    <div class="row d-flex justify-content-center mt-5">
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
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
      </div>
      <div class="col-md-8">
        <table class="table table-striped">
          <thead>
            <tr>
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
      </div>
    </div>
  `);

  // JavaScript to handle form submission and table update
  $('#userForm').submit(function(event) {
    event.preventDefault();
    
    // Fetch form values
    var firstName = $('#firstName').val();
    var lastName = $('#lastName').val();
    var username = $('#username').val();
    var role = $('#role').val();
    
    // Append new row to the table, excluding password
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
  });
});
