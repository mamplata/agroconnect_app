let soilHealths = [];

class SoilHealth {
    constructor(recordId, barangay, farmerName, nitrogenContent, phosphorusContent, potassiumContent, pH, generalRating, recommendations, season, monthYear) {
      this.recordId = recordId;
      this.barangay = barangay;
      this.farmerName = farmerName;
      this.nitrogenContent = nitrogenContent;
      this.phosphorusContent = phosphorusContent;
      this.potassiumContent = potassiumContent;
      this.pH = pH;
      this.generalRating = generalRating;
      this.recommendations = recommendations;
      this.season = season;
      this.monthYear = monthYear;
    }
  
    async addSoilHealth(soilHealths) {
      console.log(soilHealths);
  
      $.ajax({
        url: '/api/soilhealths-batch',
        method: 'POST',
        data: {
          soilHealthData: soilHealths, // Custom key for data
          _token: $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
          console.log(response);
        },
        error: function(xhr) {
          console.error(xhr.responseText);
        }
      });
  
      getSoilHealth();
    }
  
    updateSoilHealth(updatedSoilHealth) {
      const existingSoilHealth = soilHealthData.find(u => u.recordId === updatedSoilHealth.recordId);
  
      if (existingSoilHealth && existingSoilHealth.recordId !== updatedSoilHealth.recordId) {
        alert('Soil Health record ID already exists');
        return;
      }
  
      soilHealths = soilHealths.map(soilHealth =>
        soilHealth.recordId === updatedSoilHealth.recordId ? { ...soilHealth, ...updatedSoilHealth } : soilHealth
      );
  
      fetch(`/api/soilhealths/${updatedSoilHealth.recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSoilHealth),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch(error => {
          console.error('Error:', error);
        });
      getSoilHealth();
    }
  
    removeSoilHealth(soilHealths) {
      $.ajax({
        url: '/api/soilhealthsByRecords',
        method: 'DELETE',
        data: {
          soilHealthData: soilHealths, // Custom key for data
          _token: $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
          console.log(response);
        },
        error: function(xhr) {
          console.error(xhr.responseText);
        }
      });
      getSoilHealth();
    }
  }
  
  function getSoilHealth() {
    // Fetch soil health data from Laravel backend
    $.ajaxSetup({
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      }
    });
  
    $.ajax({
      url: '/api/soilhealths',
      method: 'GET',
      success: function(response) {
        soilHealths = response;
        console.log(soilHealths);
      },
      error: function(xhr, status, error) {
        console.error('Error fetching soil health data:', error);
      }
    });
  }
  
  function searchSoilHealth(farmerName) {
    const foundSoilHealth = soilHealthData.filter(soilHealth => soilHealth.farmerName.includes(farmerName));
    return foundSoilHealth;
  }
  // Function to build and return table rows as an array of SoilHealth instances
async function processSoilHealthData(workbook, cellMappings, id, season, monthYear) {
  // Select the sheet you want to read from
  var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
  var worksheet = workbook.Sheets[sheetName];

  // Find the column index for the relevant fields in cellMappings
  var barangayColumn = getKeyBySubstring(cellMappings, 'Barangay');
  var farmerColumn = getKeyBySubstring(cellMappings, 'Farmer');
  var nitrogenColumn = getKeyBySubstring(cellMappings, 'Nitrogen');
  var phosphorusColumn = getKeyBySubstring(cellMappings, 'Phosphorus');
  var potassiumColumn = getKeyBySubstring(cellMappings, 'Potassium');
  var phColumn = getKeyBySubstring(cellMappings, 'pH');
  var generalFertilityColumn = getKeyBySubstring(cellMappings, 'General Fertility');
  var recommendationsColumn = getKeyBySubstring(cellMappings, 'Recommendations');
  console.log(barangayColumn, farmerColumn, nitrogenColumn, phosphorusColumn, potassiumColumn, phColumn, generalFertilityColumn, recommendationsColumn);

  // Decode the range of the worksheet
  var range = XLSX.utils.decode_range(worksheet['!ref']);
  let soilHealthDatas = [];

  // Valid soil health values
  const validValues = new Set(['L', 'ML', 'MH', 'H']);

  // Loop through rows starting from the first row after the header
  for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      // Check if the corresponding row in columns 'Nitrogen', 'Phosphorus', 'Potassium', and 'pH' are valid
      var cellAddressNitrogen = nitrogenColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Nitrogen' cell address
      var cellValueNitrogen = worksheet[cellAddressNitrogen] ? worksheet[cellAddressNitrogen].v : '';

      var cellAddressPhosphorus = phosphorusColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Phosphorus' cell address
      var cellValuePhosphorus = worksheet[cellAddressPhosphorus] ? worksheet[cellAddressPhosphorus].v : '';

      var cellAddressPotassium = potassiumColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Potassium' cell address
      var cellValuePotassium = worksheet[cellAddressPotassium] ? worksheet[cellAddressPotassium].v : '';

      var cellAddressPh = phColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'pH' cell address
      var cellValuePh = worksheet[cellAddressPh] ? worksheet[cellAddressPh].v : '';

      // Check if all soil health values are within the valid range
      if (![cellValueNitrogen, cellValuePhosphorus, cellValuePotassium, cellValuePh].every(value => validValues.has(value))) {
          continue; // Skip this row if it doesn't meet the filter criteria
      }

      // Read values based on the defined cell mappings
      var soilHealthData = {};
      Object.keys(cellMappings).forEach(function(key) {
          var cellAddress = cellMappings[key].charAt(0) + (rowNum + 1); // Dynamically construct cell address based on key
          
          var cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : '';
          soilHealthData[key] = cellValue; // Store value for the current key in soilHealthData
      });

      // Create a new SoilHealth instance
      var soilHealth = new SoilHealth(
          id,
          getKeyBySubstring(soilHealthData, 'Barangay'),
          getKeyBySubstring(soilHealthData, 'Farmer'),
          getKeyBySubstring(soilHealthData, 'Nitrogen'),
          getKeyBySubstring(soilHealthData, 'Phosphorus'),
          getKeyBySubstring(soilHealthData, 'Potassium'),
          getKeyBySubstring(soilHealthData, 'pH'),
          getKeyBySubstring(soilHealthData, 'General Fertility'),
          getKeyBySubstring(soilHealthData, 'Recommendations'),
          season,
          monthYear,
      );

      // Add the new soil health instance to soilHealthDatas array using addSoilHealth method
      soilHealthDatas.push(soilHealth);
  }

  // Check if the record ID already exists in the soilHealthDatas array
  var existingSoilHealth = soilHealths.find(sh => sh.recordId === soilHealthDatas[0].recordId);

  if (existingSoilHealth) {
      // Remove existing soil health before adding the new one
      await soilHealthDatas[0].removeSoilHealth(soilHealthDatas);
  }

  soilHealthDatas[0].addSoilHealth(soilHealthDatas);
  return soilHealths;
}
  
  function getKeyBySubstring(obj, substr) {
    for (let key in obj) {
      if (key.includes(substr)) {
        return obj[key];
      }
    }
    return null;
  }
  