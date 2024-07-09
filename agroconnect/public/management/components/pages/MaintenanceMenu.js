// MaintenanceMenu.js

// Function to initialize the maintenance menu view
function initializeMaintenanceMenu(option) {
    // Clear previous content
    $('#maintenance-content').empty();

    // Switch based on selected option
    switch (option) {
        case 'barangay':
            initializeBarangayView();
            break;
        case 'farmer':
            initializeFarmerView();
            break;
        case 'supplyMarket':
            initializeSupplyMarketView();
            break;
        case 'price':
            initializePriceMonitoringView();
            break;
        case 'pest':
            initializePestReportsView();
            break;
        case 'disease':
            initializeSoilHealthView();
            break;
        default:
            initializeBarangayView();
    }
}

// Function to initialize Barangay Records view
function initializeBarangayView() {
    // Example content for Barangay Records
    $('#maintenance-content').html(`
       <div class="row d-flex justify-content-between align-items-center mt-5">
        <div class="col-md-4">
          <form id="userForm">
             <input type="hidden" class="form-control" id="barangayId" name="barangayId">
            <div class="mb-3">
              <input placeholder="Barangay" type="text" class="form-control" id="barangay" name="barangay" required>
            </div>
            <button type="button" class="btn btn-custom" id="submitBtn">Add Barangay</button>
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
                <th scope="col">Barangay</th>
                <th scope="col">Coordinates</th>
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
}

// Function to initialize Farmer Records view
function initializeFarmerView() {
    // Example content for Farmer Records
    $('#maintenance-content').html(`
        <!-- Insert your Farmer Records form and table structure here -->
        <h2>Farmer Records</h2>
        <p>Form and table content specific to Farmer Records...</p>
    `);
}

// Function to initialize Supply and Market view
function initializeSupplyMarketView() {
    // Example content for Supply and Market
    $('#maintenance-content').html(`
        <!-- Insert your Supply and Market form and table structure here -->
        <h2>Supply and Market</h2>
        <p>Form and table content specific to Supply and Market...</p>
    `);
}

// Function to initialize Crop Price Monitoring view
function initializePriceMonitoringView() {
    // Example content for Crop Price Monitoring
    $('#maintenance-content').html(`
        <!-- Insert your Crop Price Monitoring form and table structure here -->
        <h2>Crop Price Monitoring</h2>
        <p>Form and table content specific to Crop Price Monitoring...</p>
    `);
}

// Function to initialize Pest and Disease Reports view
function initializePestReportsView() {
    // Example content for Pest and Disease Reports
    $('#maintenance-content').html(`
        <!-- Insert your Pest and Disease Reports form and table structure here -->
        <h2>Pest and Disease Reports</h2>
        <p>Form and table content specific to Pest and Disease Reports...</p>
    `);
}

// Function to initialize Soil Health Records view
function initializeSoilHealthView() {
    // Example content for Soil Health Records
    $('#maintenance-content').html(`
        <!-- Insert your Soil Health Records form and table structure here -->
        <h2>Soil Health Records</h2>
        <p>Form and table content specific to Soil Health Records...</p>
    `);
}
