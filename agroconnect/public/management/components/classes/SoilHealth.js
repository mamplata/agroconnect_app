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
  
    async addSoilHealth(soilHealthData) {
      console.log(soilHealthData);
  
      $.ajax({
        url: '/api/soil-health-batch',
        method: 'POST',
        data: {
          soilHealthData: soilHealthData, // Custom key for data
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
  
      soilHealthData = soilHealthData.map(soilHealth =>
        soilHealth.recordId === updatedSoilHealth.recordId ? { ...soilHealth, ...updatedSoilHealth } : soilHealth
      );
  
      fetch(`/api/soil-health/${updatedSoilHealth.recordId}`, {
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
  
    removeSoilHealth(soilHealthData) {
      $.ajax({
        url: '/api/soil-healthByRecords',
        method: 'DELETE',
        data: {
          soilHealthData: soilHealthData, // Custom key for data
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
      url: '/api/soil-health',
      method: 'GET',
      success: function(response) {
        soilHealthData = response;
        console.log(soilHealthData);
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
  
  async function processSoilHealthData(workbook, cellMappings, id, season, monthYear) {
    var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
    var worksheet = workbook.Sheets[sheetName];
  
    var barangayColumn = getKeyBySubstring(cellMappings, 'Barangay');
    var farmerColumn = getKeyBySubstring(cellMappings, 'Farmer');
    var nitrogenColumn = getKeyBySubstring(cellMappings, 'Nitrogen');
    var phosphorusColumn = getKeyBySubstring(cellMappings, 'Phosphorus');
    var potassiumColumn = getKeyBySubstring(cellMappings, 'Potassium');
    var pHColumn = getKeyBySubstring(cellMappings, 'pH');
    var generalRatingColumn = getKeyBySubstring(cellMappings, 'General Fertility');
    var recommendationsColumn = getKeyBySubstring(cellMappings, 'Recommendations');
    console.log(barangayColumn, farmerColumn, nitrogenColumn, phosphorusColumn, potassiumColumn, pHColumn, generalRatingColumn, recommendationsColumn);
  
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    let soilHealthDatas = [];
  
    for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      var cellAddressBarangay = barangayColumn.charAt(0) + (rowNum + 1);
      var cellAddressFarmer = farmerColumn.charAt(0) + (rowNum + 1);
      var cellAddressNitrogen = nitrogenColumn.charAt(0) + (rowNum + 1);
      var cellAddressPhosphorus = phosphorusColumn.charAt(0) + (rowNum + 1);
      var cellAddressPotassium = potassiumColumn.charAt(0) + (rowNum + 1);
      var cellAddresspH = pHColumn.charAt(0) + (rowNum + 1);
      var cellAddressGeneralRating = generalRatingColumn.charAt(0) + (rowNum + 1);
      var cellAddressRecommendations = recommendationsColumn.charAt(0) + (rowNum + 1);
  
      var cellValueBarangay = worksheet[cellAddressBarangay] ? worksheet[cellAddressBarangay].v : '';
      var cellValueFarmer = worksheet[cellAddressFarmer] ? worksheet[cellAddressFarmer].v : '';
      var cellValueNitrogen = worksheet[cellAddressNitrogen] ? worksheet[cellAddressNitrogen].v : '';
      var cellValuePhosphorus = worksheet[cellAddressPhosphorus] ? worksheet[cellAddressPhosphorus].v : '';
      var cellValuePotassium = worksheet[cellAddressPotassium] ? worksheet[cellAddressPotassium].v : '';
      var cellValuepH = worksheet[cellAddresspH] ? worksheet[cellAddresspH].v : '';
      var cellValueGeneralRating = worksheet[cellAddressGeneralRating] ? worksheet[cellAddressGeneralRating].v : '';
      var cellValueRecommendations = worksheet[cellAddressRecommendations] ? worksheet[cellAddressRecommendations].v : '';
  
      if (!cellValueBarangay || !cellValueFarmer) {
        continue; // Skip this row if it doesn't meet the criteria
      }
  
      var soilHealthData = {
        recordId: id,
        barangay: cellValueBarangay,
        farmerName: cellValueFarmer,
        nitrogenContent: cellValueNitrogen,
        phosphorusContent: cellValuePhosphorus,
        potassiumContent: cellValuePotassium,
        pH: cellValuepH,
        generalRating: cellValueGeneralRating,
        recommendations: cellValueRecommendations,
        season: season,
        monthYear: monthYear
      };
  
      var soilHealth = new SoilHealth(
        soilHealthData.recordId,
        soilHealthData.barangay,
        soilHealthData.farmerName,
        soilHealthData.nitrogenContent,
        soilHealthData.phosphorusContent,
        soilHealthData.potassiumContent,
        soilHealthData.pH,
        soilHealthData.generalRating,
        soilHealthData.recommendations,
        soilHealthData.season,
        soilHealthData.monthYear
      );
  
      soilHealthDatas.push(soilHealth);
    }
  
    var existingSoilHealth = soilHealthData.find(s => s.recordId === soilHealthDatas[0].recordId);
  
    if (existingSoilHealth) {
      await soilHealthDatas[0].removeSoilHealth(soilHealthDatas);
      console.log('Existing soil health record removed');
    }
  
    soilHealthDatas[0].addSoilHealth(soilHealthDatas);
    return soilHealthData;
  }
  
  function getKeyBySubstring(obj, substr) {
    for (let key in obj) {
      if (key.includes(substr)) {
        return obj[key];
      }
    }
    return null;
  }
  