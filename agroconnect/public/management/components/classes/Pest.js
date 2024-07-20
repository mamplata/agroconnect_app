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
  
  function searchPest(cropName) {
    const foundPests = pests.filter(pest => pest.cropName.includes(cropName));
    return foundPests;
  }
  
  async function processPestData(workbook, cellMappings, id, season, monthYear) {
    var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
    var worksheet = workbook.Sheets[sheetName];
  
    var cropNameColumn = getKeyBySubstring(cellMappings, 'Crop Name');
    var pestNameColumn = getKeyBySubstring(cellMappings, 'Pest Name');
    console.log(cropNameColumn, pestNameColumn);
  
    var range = XLSX.utils.decode_range(worksheet['!ref']);
    let pestDatas = [];
  
    for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      var cellAddressCropName = cropNameColumn.charAt(0) + (rowNum + 1);
      var cellAddressPestName = pestNameColumn.charAt(0) + (rowNum + 1);
  
      var cellValueCropName = worksheet[cellAddressCropName] ? worksheet[cellAddressCropName].v : '';
      var cellValuePestName = worksheet[cellAddressPestName] ? worksheet[cellAddressPestName].v : '';
  
      if (!cellValueCropName || !cellValuePestName) {
        continue; // Skip this row if it doesn't meet the criteria
      }
  
      var pestData = {
        recordId: id,
        barangay: getKeyBySubstring(cellMappings, 'Barangay'),
        cropName: cellValueCropName,
        pestName: cellValuePestName,
        season: season,
        monthYear: monthYear
      };
  
      var pest = new Pest(
        pestData.recordId,
        pestData.barangay,
        pestData.cropName,
        pestData.pestName,
        pestData.season,
        pestData.monthYear
      );
  
      pestDatas.push(pest);
    }
  
    var existingPest = pests.find(p => p.recordId === pestDatas[0].recordId);
  
    if (existingPest) {
      await pestDatas[0].removePest(pestDatas);
      console.log('Existing pest removed');
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
  