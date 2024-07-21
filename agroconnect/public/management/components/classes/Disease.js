let diseases = [];

class Disease {
    constructor(recordId, barangay, cropName, diseaseName, season, monthYear) {
      this.recordId = recordId;
      this.barangay = barangay;
      this.cropName = cropName;
      this.diseaseName = diseaseName;
      this.season = season;
      this.monthYear = monthYear;
    }
  
    async addDisease(diseases) {
      console.log(diseases);
  
      $.ajax({
        url: '/api/diseases-batch',
        method: 'POST',
        data: {
          diseaseData: diseases, // Custom key for data
          _token: $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
          console.log(response);
        },
        error: function(xhr) {
          console.error(xhr.responseText);
        }
      });
  
      getDiseases();
    }
  
    updateDisease(updatedDisease) {
      const existingDisease = diseases.find(u => u.recordId === updatedDisease.recordId);
  
      if (existingDisease && existingDisease.recordId !== updatedDisease.recordId) {
        alert('Disease record ID already exists');
        return;
      }
  
      diseases = diseases.map(disease =>
        disease.recordId === updatedDisease.recordId ? { ...disease, ...updatedDisease } : disease
      );
  
      fetch(`/api/diseases/${updatedDisease.recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDisease),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
      getDiseases();
    }
  
    removeDisease(diseases) {
      $.ajax({
        url: '/api/diseasesByRecords',
        method: 'DELETE',
        data: {
          diseaseData: diseases, // Custom key for data
          _token: $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
          console.log(response);
        },
        error: function(xhr) {
          console.error(xhr.responseText);
        }
      });
      getDiseases();
    }
  }
  
  function getDiseases() {
    // Fetch diseases from Laravel backend
    $.ajaxSetup({
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      }
    });
  
    $.ajax({
      url: '/api/diseases',
      method: 'GET',
      success: function(response) {
        diseases = response;
        console.log(diseases);
      },
      error: function(xhr, status, error) {
        console.error('Error fetching diseases:', error);
      }
    });
  }
  
  function searchDisease(cropName) {
    const foundDiseases = diseases.filter(disease => disease.cropName.includes(cropName));
    return foundDiseases;
  }
  
// Function to build and return table rows as an array of Disease instances
async function processDiseaseData(workbook, cellMappings, id, season, monthYear) {
  // Select the sheet you want to read from
  var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
  var worksheet = workbook.Sheets[sheetName];   

  // Find the column index for 'Disease Observed' and 'Crops Planted' in cellMappings
  var diseaseColumn = getKeyBySubstring(cellMappings, 'Disease Observed');
  var cropsPlantedColumn = getKeyBySubstring(cellMappings, 'Crops Planted');
  console.log(diseaseColumn, cropsPlantedColumn);

  // Decode the range of the worksheet
  var range = XLSX.utils.decode_range(worksheet['!ref']);
  let diseaseDatas = [];

  // Loop through rows starting from the first row after the header
  for (var rowNum = range.s.r + 5; rowNum <= range.e.r; rowNum++) {
      // Check if the corresponding row in column 'Disease Observed' and 'Crops Planted' are not empty or 'None'
      var cellAddressDisease = diseaseColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Disease Observed' cell address
      var cellValueDisease = worksheet[cellAddressDisease] ? worksheet[cellAddressDisease].v : '';

      var cellAddressCrops = cropsPlantedColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Crops Planted' cell address
      var cellValueCrops = worksheet[cellAddressCrops] ? worksheet[cellAddressCrops].v : '';

      // Check if the disease value and crops planted value are valid
      if ((cellValueDisease === '' || cellValueDisease === 'None') || (cellValueCrops === '')) {
          continue; // Skip this row if it doesn't meet the filter criteria
      }

      // Read values based on the defined cell mappings
      var diseaseData = {};
      Object.keys(cellMappings).forEach(function(key) {
          var cellAddress = cellMappings[key].charAt(0) + (rowNum + 1); // Dynamically construct cell address based on key
          
          var cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : '';
          diseaseData[key] = cellValue; // Store value for the current key in diseaseData
      });

      // Create a new Disease instance
      var disease = new Disease(
          id,
          getKeyBySubstring(diseaseData, 'Farm Location'),
          getKeyBySubstring(diseaseData, 'Crops Planted'),
          getKeyBySubstring(diseaseData, 'Disease Observed'),
          season,
          monthYear,
      );

      // Add the new disease instance to diseaseDatas array using addDisease method
      diseaseDatas.push(disease);
  }

  // Check if the record ID already exists in the diseaseDatas array
  var existingDisease = diseases.find(d => d.recordId === diseaseDatas[0].recordId);

  if (existingDisease) {
      // Remove existing disease before adding the new one
      await diseaseDatas[0].removeDisease(diseases);
  }

  diseaseDatas[0].addDisease(diseaseDatas);
  return diseases;
}
  
  function getKeyBySubstring(obj, substr) {
    for (let key in obj) {
      if (key.includes(substr)) {
        return obj[key];
      }
    }
    return null;
  }
  