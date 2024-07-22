let pests = [];

class Pest {
    constructor(recordId, barangay, cropName, pestName, season, monthYear) {
      this.recordId = recordId;
      this.barangay = barangay;
      this.cropName = cropName;
      this.pestName = pestName;
      this.season = season;
      this.monthYear = monthYear;
    }
  
    async addPest(pests) {
      console.log(pests);
  
      $.ajax({
        url: '/api/pests-batch',
        method: 'POST',
        data: {
          pestData: pests, // Custom key for data
          _token: $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
          console.log(response);
        },
        error: function(xhr) {
          console.error(xhr.responseText);
        }
      });
  
      getPests();
    }
  
    updatePest(updatedPest) {
      const existingPest = pests.find(u => u.recordId === updatedPest.recordId);
  
      if (existingPest && existingPest.recordId !== updatedPest.recordId) {
        alert('Pest record ID already exists');
        return;
      }
  
      pests = pests.map(pest =>
        pest.recordId === updatedPest.recordId ? { ...pest, ...updatedPest } : pest
      );
  
      fetch(`/api/pests/${updatedPest.recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPest),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
      getPests();
    }
  
    removePest(pests) {
      $.ajax({
        url: '/api/pestsByRecords',
        method: 'DELETE',
        data: {
          pestData: pests, // Custom key for data
          _token: $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
          console.log(response);
        },
        error: function(xhr) {
          console.error(xhr.responseText);
        }
      });
      getPests();
    }
  }
  
  function getPests() {
    // Fetch pests from Laravel backend
    $.ajaxSetup({
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      }
    });
  
    $.ajax({
      url: '/api/pests',
      method: 'GET',
      success: function(response) {
        pests = response;
        console.log(pests);
      },
      error: function(xhr, status, error) {
        console.error('Error fetching pests:', error);
      }
    });
  }
  
  function initializeMethodsPest() {

    function searchPest(searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase(); // Convert search term to lowercase for case-insensitive search
      const foundPests = pests.filter(pest => {
        return Object.values(pest).some(value => 
          value.toString().toLowerCase().includes(lowerCaseSearchTerm)
        );
      });
      return foundPests;
    }
  
    var pageSize = 5;
    var currentPage = 1;
  
    async function displayPest(searchTerm = null) {
      // Simulate a delay of 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      $('#pestTableBody').empty();
  
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = startIndex + pageSize;
  
      const foundPests = searchTerm ? searchPest(searchTerm) : pests;
  
      if (foundPests.length > 0) {
        for (var i = startIndex; i < endIndex; i++) {
          if (i >= foundPests.length) {
            break;
          }
          var pest = foundPests[i];
          $('#pestTableBody').append(`
            <tr data-index=${pest.pestId}>
              <td>${pest.barangay}</td>
              <td>${pest.cropName}</td>
              <td>${pest.pestName}</td>
              <td>${pest.season}</td>
              <td>${pest.monthYear}</td>
            </tr>
          `);
        }
      } else {
        $('#pestTableBody').append(`
          <tr>
            <td colspan="5">No results found!</td>
          </tr>
        `);
      }

      // Reinitialize tablesorter after adding rows
      $('#pestTable').trigger('update');
    }
  
    $('#search').on('input', function() {
      let searchTerm = $('#search').val();
      displayPest(searchTerm);
    });
  
    // Pagination: Previous button click handler
    $('#prevBtn').click(function() {
      if (currentPage > 1) {
        currentPage--;
        displayPest($('#search').val());
      }
    });
  
    // Pagination: Next button click handler
    $('#nextBtn').click(function() {
      var totalPages = Math.ceil((searchPest($('#search').val()).length) / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        displayPest($('#search').val());
      }
    });
  
    getPests();
    displayPest();
  }
  
  
// Function to build and return table rows as an array of Pest instances
async function processPestData(workbook, cellMappings, id, season, monthYear) {
  // Select the sheet you want to read from
  var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
  var worksheet = workbook.Sheets[sheetName];   

  // Find the column index for 'Pest Observed' and 'Crops Planted' in cellMappings
  var pestColumn = getKeyBySubstring(cellMappings, 'Pest Observed');
  var cropsPlantedColumn = getKeyBySubstring(cellMappings, 'Crops Planted');
  console.log(pestColumn, cropsPlantedColumn);

  // Decode the range of the worksheet
  var range = XLSX.utils.decode_range(worksheet['!ref']);
  let pestDatas = [];

  // Loop through rows starting from the first row after the header
  for (var rowNum = range.s.r + 5; rowNum <= range.e.r; rowNum++) {
      // Check if the corresponding row in column 'Pest Observed' and 'Crops Planted' are not empty or 'None'
      var cellAddressPest = pestColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Pest Observed' cell address
      var cellValuePest = worksheet[cellAddressPest] ? worksheet[cellAddressPest].v : '';

      var cellAddressCrops = cropsPlantedColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Crops Planted' cell address
      var cellValueCrops = worksheet[cellAddressCrops] ? worksheet[cellAddressCrops].v : '';

      // Check if the pest value and crops planted value are valid
      if ((cellValuePest === '' || cellValuePest === 'None') || (cellValueCrops === '')) {
           console.log(cellValueCrops);
          continue; // Skip this row if it doesn't meet the filter criteria
      }

      // Read values based on the defined cell mappings
      var pestData = {};
      Object.keys(cellMappings).forEach(function(key) {
          var cellAddress = cellMappings[key].charAt(0) + (rowNum + 1); // Dynamically construct cell address based on key
          
          var cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : '';
          pestData[key] = cellValue; // Store value for the current key in pestData
      });

      // Create a new Pest instance
      var pest = new Pest(
          id,
          getKeyBySubstring(pestData, 'Farm Location'),
          getKeyBySubstring(pestData, 'Crops Planted'),
          getKeyBySubstring(pestData, 'Pest Observed'),
          season,
          monthYear,
      );

      // Add the new pest instance to pestDatas array using addPest method
      pestDatas.push(pest);
  }

  // Check if the record ID already exists in the pestDatas array
  var existingPest = pests.find(p => p.recordId === pestDatas[0].recordId);

  if (existingPest) {
      // Remove existing pest before adding the new one
      await pestDatas[0].removePest(pests);
  }

  pestDatas[0].addPest(pestDatas);
  return pests;
}
  
  function getKeyBySubstring(obj, substr) {
    for (let key in obj) {
      if (key.includes(substr)) {
        return obj[key];
      }
    }
    return null;
  }
  