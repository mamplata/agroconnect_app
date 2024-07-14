$(document).ready(function() {
  // Function to initialize the manage users view
  function initializeManageUsersView() {
    $('#main-content').html(`
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <div>
              <select id="maintenance-option" class="form-select" name="role" required>
                  <option value="crop">Crop Records</option>
                  <option value="barangay">Barangay Records</option>
                  <option value="farmer">Farmer Records</option>
                  <option value="supplyMarket">Supply and Market</option>
                  <option value="price">Crop Price Monitoring</option>
                  <option value="pest">Pest and Disease Reports</option>
                  <option value="disease">Soil Health Records</option>
              </select>
          </div>
          <div class="input-group">
              <div class="input-group-prepend">
                  <span class="input-group-text border-0 bg-transparent"><i class="fas fa-search"></i></span>
              </div>
              <input placeholder="Search name..." type="text" class="form-control rounded-pill" id="search" name="search">
          </div>
      </div>
      <div id="maintenance-content">
          <!-- Content for the selected maintenance option will be dynamically loaded here -->
      </div>
  `);
      // Handle change in maintenance option select
      $('#maintenance-option').change(function() {
          var selectedOption = $(this).val();
          initializeMaintenanceMenu(selectedOption);
      });

      // Initialize default maintenance option view
      var defaultOption = $('#maintenance-option').val();
      initializeMaintenanceMenu(defaultOption);
  }
  // Initialize manage users view when document is ready
  initializeManageUsersView();
});
