// Farmer.js
let farmers = [];
let barangayArray = [];

class Farmer {
  constructor(barangayId, farmerId, farmerName, fieldArea, fieldType, phoneNumber) {
    this.barangayId = barangayId;
    this.farmerId = farmerId;
    this.farmerName = farmerName;
    this.fieldArea = fieldArea;
    this.fieldType = fieldType;
    this.phoneNumber = phoneNumber;
  }

  createFarmer(farmer) {
    const existingFarmer = farmers.find(b => b.farmerName === farmer.farmerName);
    if (existingFarmer) {
      alert('Farmer already exists');
      return;
    }

    fetch('/api/farmers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(farmer),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  updateFarmer(updatedFarmer) {
    const existingFarmer = farmers.find(b => b.farmerName === updatedFarmer.farmerName);

    if (existingFarmer && Farmer.farmerId !== updatedFarmer.farmerId) {
      alert('Farmer already exists');
      return;
    }

    farmers = farmers.map(farmer =>
        farmer.farmerId === updatedFarmer.farmerId ? { ...farmer, ...updatedFarmer } : farmers
    );

    fetch(`/api/farmers/${updatedFarmer.farmerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFarmer),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  removeFarmer(farmerId) {
    fetch(`/api/farmers/${farmerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (response.status === 204) {
          farmers = farmers.filter(farmer => farmer.farmerId !== farmer);
          console.log(`Farmer with ID ${farmerId} deleted.`);
        } else if (response.status === 404) {
          console.error(`Farmer with ID ${farmerId} not found.`);
        } else {
          console.error(`Failed to delete farmer with ID ${farmerId}.`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

function getFarmer() {
  // Fetch farmers from Laravel backend
  $.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  // Fetch farmers from Laravel backend
  $.ajax({
    url: '/api/farmers', // Endpoint to fetch farmers
    method: 'GET',
    success: function(response) {
        // Assuming response is an array of farmers 
        farmer = response;

        farmers = farmer;
        console.log(farmers);
    },
    error: function(xhr, status, error) {
        console.error('Error fetching farmers:', error);
    }
  });
}

getFarmer();

function getBarangayNames() {
    // Fetch barangays from Laravel backend
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    // Fetch barangays from Laravel backend
    $.ajax({
        url: '/api/barangays', // Endpoint to fetch barangays
        method: 'GET',
        success: function(response) {
            // Assuming response is an array of barangays 
            const barangays = response;
            barangayArray = barangays;
            console.log(barangays);

            // Populate select dropdown with barangays
            const barangaySelect = $('#barangay-option');
            barangaySelect.empty(); // Clear existing options
            barangaySelect.append(`<option value="" disabled selected>Select Barangay</option>`);
            barangays.forEach(b => {
                barangaySelect.append(`<option value="${b.barangayId}">${b.barangayName}</option>`);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching barangays:', error);
        }
    });
}

function searchFarmer(farmerName) {
  const foundFarmers = farmers.filter(farmer => farmer.farmerName.includes(farmerName));
  return foundFarmers;
}

function getBarangayName(id) {

    // Find the barangay object with the matching ID
    const barangay = barangayArray.find(barangay => barangay.barangayId === id);

    // Return the name of the barangay if found, or null if not found
    return barangay ? barangay.barangayName : null;
}

function getBarangayId(name) {

    // Find the barangay object with the matching ID
    const barangay = barangayArray.find(barangay => barangay.barangaName === name);

    // Return the name of the barangay if found, or null if not found
    return barangay ? barangay.barangayId: null;
}

function initializeMethodsFarmer() {
    var selectedRow = null;
    var pageSize = 5;
    var currentPage = 1;
    var farmer = null;

    async function displayFarmers(farmerName = null) {

      // Simulate a delay of 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      $('#farmerTableBody').empty();
    
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = startIndex + pageSize;
      if (farmerName) {
        // Display a single farmer if farmerName is provided
          const foundfarmers = searchfarmer(farmerName);
          if (foundfarmers.length > 0) {
            foundfarmers.forEach(farmer => {
              $('#farmerTableBody').append(`
                <tr data-index=${farmer.farmerId}>
                  <td style="display: none;">${farmer.farmerId}</td>
                  <td>${getBarangayName(farmer.barangayId)}</td>
                  <td>${farmer.farmerName}</td>
                  <td>${farmer.fieldArea}</td>
                  <td>${farmer.fieldType}</td>
                  <td>${farmer.phoneNumber}</td>
                </tr>
              `);
            });
          } else {
            // Handle case where farmerName is not provided
            $('#farmerTableBody').append(`
              <tr>
                <td colspan="4">farmer not found!</td>
              </tr>
            `)
          }
      } else {
        // Display paginated farmers if no farmerName is provided
        for (var i = startIndex; i < endIndex; i++) {
          if (i >= farmers.length) {
            break;
          }
          var farmer = farmers[i];
          $('#farmerTableBody').append(`
            <tr data-index=${farmer.farmerId}>
              <td style="display: none;">${farmer.farmerId}</td>
                <td data-barangay-id=${farmer.barangayId}>${getBarangayName(farmer.barangayId)}</td>
                <td>${farmer.farmerName}</td>
                <td>${farmer.fieldArea}</td>
                <td>${farmer.fieldType}</td>
                <td>${farmer.phoneNumber}</td>
            </tr>
          `);
        }
      }
    }
    

    // Display initial farmers
    displayFarmers();

    $('#search').change(function() {
      let farmerName = $('#search').val();
      displayfarmers(farmerName);
    });

    // Pagination: Previous button click handler
    $('#prevBtn').click(function() {
      if (currentPage > 1) {
        currentPage--;
        displayfarmers();
      }
    });

    // Pagination: Next button click handler
    $('#nextBtn').click(function() {
      var totalPages = Math.ceil(farmers.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        displayFarmers();
      }
    });

    // Form submission handler (Add or Update farmer)
    $('#submitBtn').click(function(event) {
      event.preventDefault();

      var farmerId = Number($('#farmerId').val());
      var farmerName = $('#farmerName').val();
      var fieldArea = parseInt($('#fieldArea').val(), 10);
      var fieldType= $('#fieldType').val();
      var fieldType= $('#phoneNumber').val();
      var barangayId = parseInt($('#barangay-option').val(), 10);
      if (selectedRow !== null) {

        let farmer = new Farmer(barangayId, farmerId, farmerName, fieldArea, fieldType, phoneNumber);
        console.log(farmer);
        farmer.updateFarmer(farmer);
        selectedRow = null;
        $('#submitBtn').text('Add farmer');
        $('#cancelBtn').hide(); 
        resetFields();
      } else {
        let farmer = new Farmer(barangayId, farmerId, farmerName, fieldArea, fieldType, phoneNumber);
        console.log(farmer);
        farmer.createFarmer(farmer);
      }

      // Clear form fields after submission
      $('#farmerForm')[0].reset();
      selectedRow = null;
      $('#farmerTableBody tr').removeClass('selected-row');
      getFarmer();
      displayFarmers();
    });

    function resetFields() {
      // Reset UI states
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
      selectedRow = null;
      $('#farmerTableBody tr').removeClass('selected-row');
    }

    $('#editBtn').click(function() { 
        // Open the delete modal
        $('#dataEdit').text('farmer');
        $('#editModal').modal('show');

        // Edit button click handler
        $('#confirmEditBtn').click(function() {
          $('#editModal').modal('hide');
          $('#cancelBtn').show();
          $('#farmerId').val(farmer.farmerId);
          $('#farmerName').val(farmer.farmerName);
          $('#fieldArea').val(farmer.fieldArea);
          $('#fieldType').val(farmer.fieldType);
          $('#phoneNumber').val(farmer.phoneNumber);
          $('#barangay-option').val(farmer.barangayId);
          $('#submitBtn').text('Update Farmer');
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
        $('#farmerForm')[0].reset();
        $('#submitBtn').text('Add Farmer');
        $('#cancelBtn').hide();
        $('#farmerTableBody tr').removeClass('selected-row');
      }
    });

  // Delete button click handler
  $('#deleteBtn').click(function() {
    // Open the delete modal
    $('#dataDelete').text('farmer');
    $('#deleteModal').modal('show');

    // Click handler for modal's delete button
    $('#confirmDeleteBtn').click(function() {
      // Close the modal
      $('#deleteModal').modal('hide');
        farmerToDelete = new Farmer();
        farmerToDelete.removeFarmer(farmer.farmerId);
        getFarmer();
        displayFarmers();
        resetFields();
      });

    $('#cancelDelete').click(function() {
      resetFields();
    });
  });

// Row click handler (for selecting rows)
$('#farmerTableBody').on('click', 'tr', function() {
  var $this = $(this);
  var farmerId = $this.data('index');
  farmer = farmers.find(u => u.farmerId === farmerId);
  selectedRow = farmerId;
  // Highlight selected row
  if (selectedRow !== null) {
  $('#farmerTableBody tr').removeClass('selected-row');
  $('#farmerTableBody tr').filter(function() {
    return parseInt($(this).find('td:eq(0)').text(), 10) === selectedRow;
  }).addClass('selected-row');
  $('#editBtn').prop('disabled', false);
  $('#deleteBtn').prop('disabled', false);
} else {
  $('#farmerTableBody tr').removeClass('selected-row');
}

});
}