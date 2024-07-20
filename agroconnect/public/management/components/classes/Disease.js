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
  
  async function processDiseaseData(workbook, cellMappings, id, season, monthYear) {
    var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
    var worksheet = workbook.Sheets[sheetName];
  
    var cropNameColumn = getKeyBySubstring(cellMappings, 'Crop Name');
    var diseaseNameColumn = getKeyBySubstring(cellMappings, 'Disease Name');
    console.log(cropNameColumn, diseaseNameColumn);
  
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    let diseaseDatas = [];
  
    for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      var cellAddressCropName = cropNameColumn.charAt(0) + (rowNum + 1);
      var cellAddressDiseaseName = diseaseNameColumn.charAt(0) + (rowNum + 1);
  
      var cellValueCropName = worksheet[cellAddressCropName] ? worksheet[cellAddressCropName].v : '';
      var cellValueDiseaseName = worksheet[cellAddressDiseaseName] ? worksheet[cellAddressDiseaseName].v : '';
  
      if (!cellValueCropName || !cellValueDiseaseName) {
        continue; // Skip this row if it doesn't meet the criteria
      }
  
      var diseaseData = {
        recordId: id,
        barangay: getKeyBySubstring(cellMappings, 'Barangay'),
        cropName: cellValueCropName,
        diseaseName: cellValueDiseaseName,
        season: season,
        monthYear: monthYear
      };
  
      var disease = new Disease(
        diseaseData.recordId,
        diseaseData.barangay,
        diseaseData.cropName,
        diseaseData.diseaseName,
        diseaseData.season,
        diseaseData.monthYear
      );
  
      diseaseDatas.push(disease);
    }
  
    var existingDisease = diseases.find(d => d.recordId === diseaseDatas[0].recordId);
  
    if (existingDisease) {
      await diseaseDatas[0].removeDisease(diseaseDatas);
      console.log('Existing disease removed');
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
  