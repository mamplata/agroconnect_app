// MaintenanceMenu.js

// Function to initialize the maintenance menu view
function initializeMaintenanceMenu(option) {
    // Clear previous content
    $('#maintenance-content').empty();

    // Switch based on selected option
    switch (option) {
        case 'crop':
            initializeCropView();
            break;
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
function initializeCropView() {
   // Example content for Crop Records
   $('#maintenance-content').html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
     <div class="col-md-4">
       <form id="cropForm">
          <input type="hidden" class="form-control" id="cropId" name="cropId">
         <div class="mb-3">
           <input placeholder="Crop Name" type="text" class="form-control" id="cropName" name="cropName" required>
         </div>
         <div class="mb-3">
           <input placeholder="Variety" type="text" class="form-control" id="variety" name="variety" required>
         </div>
         <div class="mb-3">
           <select class="form-control" id="type" name="type" required>
             <option value="" disabled selected>Select Type</option>
             <option value="Vegetables">Vegetables</option>
             <option value="Rice">Rice</option>
             <option value="Fruit Trees">Fruit Trees</option>
           </select>
         </div>
         <div class="mb-3">
           <select class="form-control" id="priceValue" name="priceValue" required>
             <option value="" disabled selected>Select Price Value</option>
             <option value="kg">kg</option>
             <option value="pcs">pcs</option>
           </select>
         </div>
         <button type="button" class="btn btn-custom" id="submitBtn">Add Crop</button>
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
       <table id="cropTable" class="table table-custom text-center">
         <thead>
           <tr style="background-color: #2774E9; color: white;">
             <th scope="col">Crop Name</th>
             <th scope="col">Variety</th>
             <th scope="col">Type</th>
             <th scope="col">Price Value</th>
           </tr>
         </thead>
         <tbody id="cropTableBody">
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
  initializeMethodsCrop();
  createDeleteModal();
  createEditModal();  
}

// Function to initialize Barangay Records view
function initializeBarangayView() {
    // Example content for Barangay Records
    $('#maintenance-content').html(`
       <div class="row d-flex justify-content-between align-items-center mt-5">
        <div class="col-md-4">
          <form id="barangayForm">
             <input type="hidden" class="form-control" id="barangayId" name="barangayId">
            <div class="mb-3">
              <input placeholder="Barangay" type="text" class="form-control" id="barangayName" name="barangayName" required>
            </div>
            <button type="button" class="btn btn-custom" id="submitBtn">Add Barangay</button>
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
          <table id="barangayTable" class="table table-custom text-center">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">Barangay</th>
                <th scope="col">Coordinates</th>
              </tr>
            </thead>
            <tbody id="barangayTableBody">
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
    initializeMethodsBarangay();
    createDeleteModal();
    createEditModal();  
}

// Function to initialize Farmer Records view
function initializeFarmerView() {
    // Example content for Farmer Records
    $('#maintenance-content').html(`
      <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col-md-4">
        <form id="farmerForm">
            <input type="hidden" class="form-control" id="farmerId" name="farmerId">
          <div class="mb-3">
            <select style='width: 100%;' id="barangay-option" class="form-control" name="barangayId" required>
            </select>
          </div>
          <div class="mb-3">
            <input placeholder="Farmer Name" type="text" class="form-control" id="farmerName" name="farmerName" required>
          </div>
          <div class="mb-3">
            <input placeholder="Field Area" type="number" step="0.01" class="form-control" id="fieldArea" name="fieldArea">
          </div>
          <div class="mb-3">
            <select style='width: 100%;' id="fieldType" class="form-control" name="fieldType" required>
            <option value="" disabled selected>Select Field Type</option>
             <option value='Vegetables'>Vegetables</option>
             <option value='Rice'>Rice</option>
             <option value='Fruit Trees'>Fruit Trees</option>
             <option value='OA'>OA</option>
             <option value='Corn'>Corn</option>
            </select>
          </div>
          <button type="button" class="btn btn-custom" id="submitBtn">Add Farmer</button>
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
        <table id="farmerTable" class="table table-custom text-center">
          <thead>
            <tr style="background-color: #2774E9; color: white;">
              <th scope="col">Barangay</th>
              <th scope="col">Farmer Name</th>
              <th scope="col">Field Area</th>
              <th scope="col">Field Type</th>
            </tr>
          </thead>
          <tbody id="farmerTableBody">
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
    getBarangayNames();
    initializeMethodsFarmer();
    createDeleteModal();
    createEditModal();
}

// Function to initialize Supply and Market view
function initializeSupplyMarketView() {
    // Example content for Supply and Market
    $('#maintenance-content').html(`
      <div class="row d-flex justify-content-between align-items-center mt-5">
        <div class="col-md-4">
          <form id="recordForm" enctype="multipart/form-data">
            <input type="hidden" class="form-control" id="recordId" name="recordId">
            <input type="hidden" class="form-control" id="userId" name="userId">
            <div class="mb-3">
              <input placeholder="Name" type="text" class="form-control" id="name" name="name" required>
            </div>
            <div class="mb-3">
              <div class="input-group" id="monthPicker" style="width: 100%;">
                  <select class="form-control" required>
                      <option value="" disabled selected>Month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                  </select>
                  <span class="input-group-append">
                      <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
                  </span>
              </div>
          </div>
          <div class="mb-3">
              <div class="input-group" id="yearPicker" style="width: 100%;">
                  <input type="text" class="form-control" placeholder="Year" required>
                  <span class="input-group-append">
                      <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
                  </span>
              </div>
          </div>
            <div  class="mb-3">
              <label id="lblUpload">
                Upload File:
              </label>
              <div class="input-group" style="width: 100%;">
                <input type="file" class="form-control" id="fileRecord" name="fileRecord" accept=".xls, .xlsx" required>
                <div class="input-group-append">
                  <label class="input-group-text" for="fileRecord" id="btnUpload">
                    <i class="fas fa-upload"></i>
                  </label>
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-custom" id="submitBtn">Add Record</button>
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
          <table id="recordTable" class="table table-custom text-center">
            <thead>
              <tr style="background-color: #2774E9; color: white;">
                <th scope="col">File Name</th>
                <th scope="col">File Size</th>
              </tr>
            </thead>
            <tbody id="recordTableBody">
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
    initializeMethodsRecord('production');
    createDeleteModal();
    createEditModal();
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
