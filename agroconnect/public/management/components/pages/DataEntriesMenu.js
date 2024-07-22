// MaintenanceMenu.js

// Function to initialize the maintenance menu view
function initializeDataEntriesMenu(option) {
    // Clear previous content
    $('#maintenance-content').empty();

    // Switch based on selected option
    switch (option) {
        case 'productions':
            initializeProductionView();
            break;
        case 'prices':
            initializePriceView();
            break;
        case 'pest':
            initializePestView();
            break;
        case 'diseases':
            initializeDiseaseView();
            break;
        case 'soil_healths':
            initializeSoilHealthView();
            break;
        default:
            initializeProductionView();
    }
}

// Function to initialize Barangay Records view
function initializeProductionView() {
   $('#entries-content').html(`
    <div class="row d-flex justify-content-between align-items-center mt-5">
      <div class="col-md-12">
        <table id="productionTable" class="table table-custom text-center">
          <thead>
            <tr style="background-color: #2774E9; color: white;">
              <th scope="col">Barangay</th>
              <th scope="col">Commodity</th>
              <th scope="col">Variety</th>
              <th scope="col">Area Planted</th>
              <th scope="col">Month Planted</th>
              <th scope="col">Month Harvested</th>
              <th scope="col">Volume of Production</th>
              <th scope="col">Cost of Production</th>
              <th scope="col">Farm Gate Price</th>
              <th scope="col">Volume Sold</th>
              <th scope="col">Season</th>
              <th scope="col">Month Year</th>
            </tr>
          </thead>
          <tbody id="productionTableBody">
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
