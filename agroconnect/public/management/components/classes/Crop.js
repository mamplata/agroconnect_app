// Crop.js
let crops = [];

class Crop {
  constructor(cropId, cropName, priceWeight, type, variety, cropImg, description) {
    this.cropId = cropId;
    this.cropName = cropName;
    this.priceWeight = priceWeight;
    this.type = type;
    this.variety = variety;
    this.cropImg = cropImg;
    this.description = description;
  }

  createCrop(crop) {
    // Check for duplicates based on both cropName and variety
    const existingCrop = crops.find(c => c.cropName === crop.cropName && c.variety === crop.variety);
    if (existingCrop) {
      alert('Crop with the same name and variety already exists');
      return;
    }

    console.log(crop.priceWeight);

    $.ajax({
      url: '/api/crops',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(crop),
      success: function(data) {
        console.log('Success:', data);
      },
      error: function(error) {
        console.error('Error:', error);
      }
    });
  }

  updateCrop(updatedCrop) {
    // Check for duplicates based on both cropName and variety, excluding the current crop
    const existingCrop = crops.find(c => c.cropName === updatedCrop.cropName && c.variety === updatedCrop.variety && c.cropId !== updatedCrop.cropId);
    if (existingCrop) {
      alert('Crop with the same name and variety already exists');
      return;
    }

    // Update the crop in the local crops array
    crops = crops.map(crop =>
      crop.cropId === updatedCrop.cropId ? { ...crop, ...updatedCrop } : crop
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
          crops = crops.filter(crop => crop.cropId !== cropId);
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
  
      // Clear the table body
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
                          <td><img src="${crop.cropImg}" alt="${crop.cropName}" class="img-thumbnail" width="50" height="50"></td>
                          <td>${crop.description}</td>
                          <td>${crop.cropName}</td>
                          <td>${crop.variety}</td>
                          <td>${crop.type}</td>
                          <td>${crop.priceWeight}</td>
                      </tr>
                  `);
              });
          } else {
              // Handle case where cropName is not found
              $('#cropTableBody').append(`
                  <tr>
                      <td colspan="7">Crop not found!</td>
                  </tr>
              `);
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
                      <td><img src="${crop.cropImg}" alt="${crop.cropName}" class="img-thumbnail" width="50" height="50"></td>
                      <td>${crop.description}</td>
                      <td>${crop.cropName}</td>
                      <td>${crop.type}</td>
                      <td>${crop.variety}</td>
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
  if (priceWeight === 'pc') {
      var pcToKg = $('#pcToKg').val();
      priceWeight = `pc/(about ${pcToKg}kg)`;
  }
  var type = $('#type').val();
  var variety = $('#variety').val();
  var description = $('#description').val();

  // Get the file input element and the selected file
  var cropImgFile = document.getElementById('cropImg').files[0];
  var cropImgBase64 = null;  // Initialize as null

  if (cropImgFile) {
      var reader = new FileReader();
      reader.onloadend = function() {
          cropImgBase64 = reader.result; // This is the base64 string

          // Create the Crop object with the base64 image string
          let crop = new Crop(cropId, cropName, priceWeight, type, variety, cropImgBase64, description);

          if (selectedRow !== null) {
              crop.updateCrop(crop);
              selectedRow = null;
              $('#submitBtn').text('Add crop');
              $('#cancelBtn').hide(); 
          } else {
              crop.createCrop(crop);
          }

          getCrop();
          displayCrops();

          // Clear form fields after submission
          $('#cropForm')[0].reset();
          $('#cropTableBody tr').removeClass('selected-row');
      };

      // Read the image file as a data URL (base64)
      reader.readAsDataURL(cropImgFile);
  } else {
      // Handle form submission without a new image
      // Use null for image when no new image is provided during update
      if (selectedRow !== null) {
          let crop = new Crop(cropId, cropName, priceWeight, type, variety, null, description);
          crop.updateCrop(crop);
          selectedRow = null;
          $('#submitBtn').text('Add crop');
          $('#cancelBtn').hide(); 
      } else {
          let crop = new Crop(cropId, cropName, priceWeight, type, variety, null, description);
          crop.createCrop(crop);
      }

      getCrop();
      displayCrops();

      // Clear form fields after submission
      $('#cropForm')[0].reset();
      $('#lblCropImg').val('Upload Image:');
      $('#cropTableBody tr').removeClass('selected-row');
  }
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
          $('#variety').val(crop.variety);
          $('#description').val(crop.description);
          $('#lblCropImg').text('Upload New Image (Optional):');
          // Split the string at the '/' and take the first part
          var extractedValue = crop.priceWeight.split('/')[0].trim();
          $('#priceWeight').val(extractedValue);
          if (extractedValue === 'pc') {
            $('#pcToKg').show();
        } else {
            $('#pcToKg').hide();
        }
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
        let cropToDelete = new Crop();
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