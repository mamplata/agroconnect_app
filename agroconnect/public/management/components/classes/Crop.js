// Crop.js
let crops = [];

class Crop {
  constructor(cropId, cropName, priceWeight, type) {
    this.cropId = cropId;
    this.cropName = cropName;
    this.priceWeight = priceWeight;
    this.type = type;
  }

  createCrop(crop) {
    const existingCrop = crops.find(c => c.cropName === crop.cropName);
    if (existingCrop) {
      alert('Crop with the same name already exists');
      return;
    }

    fetch('/api/crops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(crop),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  updateCrop(updatedCrop) {
    const existingCrop = crops.find(c => c.cropName === crop.cropName);
    if (existingCrop) {
      alert('Crop with the same name already exists');
      return;
    }

    if (existingCrop && existingCrop.cropId !== updatedCrop.cropId) {
      alert('Crop already exists');
      return;
    }

    crops = crops.map(crop =>
        crop.cropId === updatedCrop.cropId ? { ...crop, ...updatedCrop } : crops
    );

    fetch(`/api/crops/${updatedCrop.cropId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCrop),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  removeCrop(cropId) {
    fetch(`/api/crops/${cropId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (response.status === 204) {
          crops = crops.filter(crop => crop.cropId !== crop);
          console.log(`Crop with ID ${cropId} deleted.`);
        } else if (response.status === 404) {
          console.error(`Crop with ID ${cropId} not found.`);
        } else {
          console.error(`Failed to delete crop with ID ${cropId}.`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

function getCrop() {
  // Fetch crops from Laravel backend
  $.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  // Fetch crops from Laravel backend
  $.ajax({
    url: '/api/crops', // Endpoint to fetch crops
    method: 'GET',
    success: function(response) {
        // Assuming response is an array of crops 
        let crop = response;

        crops = crop;
        console.log(crops);
    },
    error: function(xhr, status, error) {
        console.error('Error fetching crops:', error);
    }
  });
}

getCrop();


function searchCrop(cropName) {
  const foundCrops = crops.filter(crop => 
    crop.cropName.toLowerCase().includes(cropName.toLowerCase())
  );
  return foundCrops;
}

function initializeMethodsCrop() {
    var selectedRow = null;
    var pageSize = 5;
    var currentPage = 1;
    var crop = null;

    async function displayCrops(cropName = null) {

      // Simulate a delay of 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      $('#cropTableBody').empty();
    
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = startIndex + pageSize;
      if (cropName) {
        // Display a single crop if cropName is provided
          const foundcrops = searchCrop(cropName);
          if (foundcrops.length > 0) {
            foundcrops.forEach(crop => {
              $('#cropTableBody').append(`
                <tr data-index=${crop.cropId}>
                  <td style="display: none;">${crop.cropId}</td>
                  <td>${crop.cropName}</td>
                  <td>${crop.type}</td>
                  <td>${crop.priceWeight}</td>
                </tr>
              `);
            });
          } else {
            // Handle case where cropName is not provided
            $('#cropTableBody').append(`
              <tr>
                <td colspan="4">crop not found!</td>
              </tr>
            `)
          }
      } else {
        // Display paginated crops if no cropName is provided
        for (var i = startIndex; i < endIndex; i++) {
          if (i >= crops.length) {
            break;
          }
          var crop = crops[i];
          $('#cropTableBody').append(`
            <tr data-index=${crop.cropId}>
              <td style="display: none;">${crop.cropId}</td>
                <td>${crop.cropName}</td>
                <td>${crop.type}</td>
                <td>${crop.priceWeight}</td>
            </tr>
          `);
        }
      }
    }
    

    // Display initial crops
    displayCrops();

    $('#search').on('input', function() {
      let cropName = $('#search').val();
      displayCrops(cropName);
    });

    // Pagination: Previous button click handler
    $('#prevBtn').click(function() {
      if (currentPage > 1) {
        currentPage--;
        displaycrops();
      }
    });

    // Pagination: Next button click handler
    $('#nextBtn').click(function() {
      var totalPages = Math.ceil(crops.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        displayCrops();
      }
    });

    // Form submission handler (Add or Update crop)
    $('#submitBtn').click(function(event) {
      event.preventDefault();

      var cropId = Number($('#cropId').val());
      var cropName = $('#cropName').val();
      var priceWeight = $('#priceWeight').val();
      var type = $('#type').val();
      if (selectedRow !== null) {
        let crop = new Crop(cropId, cropName, priceWeight, type);
        crop.updateCrop(crop);
        getCrop();
        displayCrops();
        selectedRow = null;
        $('#submitBtn').text('Add crop');
        $('#cancelBtn').hide(); 
        resetFields();
      } else {
        let crop = new Crop(cropId, cropName, priceWeight, type);
        crop.createCrop(crop);
        getCrop();
        displayCrops();
      }

      // Clear form fields after submission
      $('#cropForm')[0].reset();
      selectedRow = null;
      $('#cropTableBody tr').removeClass('selected-row');
    });

    function resetFields() {
      // Reset UI states
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
      selectedRow = null;
      $('#cropTableBody tr').removeClass('selected-row');
    }

    $('#editBtn').click(function() { 
        // Open the delete modal
        $('#dataEdit').text('crop');
        $('#editModal').modal('show');

        // Edit button click handler
        $('#confirmEditBtn').click(function() {
          $('#editModal').modal('hide');
          $('#cancelBtn').show();
          $('#cropId').val(crop.cropId);
          $('#cropName').val(crop.cropName);
          $('#priceWeight').val(crop.priceWeight);
          $('#type').val(crop.type);
          $('#submitBtn').text('Update Crop');
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
        $('#cropForm')[0].reset();
        $('#submitBtn').text('Add Crop');
        $('#cancelBtn').hide();
        $('#cropTableBody tr').removeClass('selected-row');
      }
    });

  // Delete button click handler
  $('#deleteBtn').click(function() {
    // Open the delete modal
    $('#dataDelete').text('crop');
    $('#deleteModal').modal('show');

    // Click handler for modal's delete button
    $('#confirmDeleteBtn').click(function() {
      // Close the modal
      $('#deleteModal').modal('hide');
        cropToDelete = new Crop();
        cropToDelete.removeCrop(crop.cropId);
        getCrop();
        displayCrops();
        resetFields();
      });

    $('#cancelDelete').click(function() {
      resetFields();
    });
  });

// Row click handler (for selecting rows)
$('#cropTableBody').on('click', 'tr', function() {
  var $this = $(this);
  var cropId = $this.data('index');
  crop = crops.find(u => u.cropId === cropId);
  selectedRow = cropId;
  // Highlight selected row
  if (selectedRow !== null) {
  $('#cropTableBody tr').removeClass('selected-row');
  $('#cropTableBody tr').filter(function() {
    return parseInt($(this).find('td:eq(0)').text(), 10) === selectedRow;
  }).addClass('selected-row');
  $('#editBtn').prop('disabled', false);
  $('#deleteBtn').prop('disabled', false);
} else {
  $('#cropTableBody tr').removeClass('selected-row');
}

});
}

export { Crop, getCrop, searchCrop, initializeMethodsCrop, crops};