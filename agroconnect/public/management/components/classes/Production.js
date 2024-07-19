let productions = [];

class Production {
  constructor(recordId, barangay, cropName, variety, areaPlanted, monthPlanted, monthHarvested, volumeProduction, productionCost, price, volumeSold, season, monthYear) {
    this.recordId = recordId;
    this.barangay = barangay;
    this.cropName = cropName;
    this.variety = variety;
    this.areaPlanted = areaPlanted;
    this.monthPlanted = monthPlanted;
    this.monthHarvested = monthHarvested;
    this.volumeProduction = volumeProduction;
    this.productionCost = productionCost;
    this.volumeSold = volumeSold;
    this.price = price;
    this.season = season;
    this.monthYear = monthYear;
  }

  async addProduction(productions) {

    console.log(productions);

    try {
      const response = await fetch('/api/productions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productions),
      });
      
      console.log('Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Full Response:', errorText);
        throw new Error('Failed to create record');
      }

      const data = await response.json();
      console.log('Success:', data);
      return data.recordId;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  updateProduction(updatedProduction) {
    const existingProduction = productions.find(u => u.productionId === updatedProduction.productionId);

    if (existingProduction && existingProduction.productionId !== updatedProduction.productionId) {
      alert('Production ID already exists');
      return;
    }

    productions = productions.map(production =>
      production.recordId === updatedProduction.recordId ? { ...production, ...updatedProduction } : production
    );

    fetch(`/api/productions/${updatedProduction.productionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProduction),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  removeProduction(productionId) {
    fetch(`/api/productions/${productionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (response.status === 204) {
          productions = productions.filter(production => production.productionId !== productionId);
          console.log(`Production with ID ${productionId} deleted.`);
        } else if (response.status === 404) {
          console.error(`Production with ID ${productionId} not found.`);
        } else {
          console.error(`Failed to delete production with ID ${productionId}.`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

function getProduction() {
  // Fetch productions from Laravel backend
  $.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  $.ajax({
    url: '/api/productions',
    method: 'GET',
    success: function(response) {
        // Assuming response is an array of productions [{...fields...}, ...]
        productions = response;
        console.log(productions);
    },
    error: function(xhr, status, error) {
        console.error('Error fetching productions:', error);
    }
  });
}

getProduction();

function searchProduction(cropName) {
  const foundProductions = productions.filter(production => production.cropName.includes(cropName));
  return foundProductions;
}

// Function to build and return table rows as an array of Production instances
async function processProductionData(workbook, cellMappings, id, season, monthYear) {
  // Assuming workbook is already loaded or passed as a parameter

  // Select the sheet you want to read from
  var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
  var worksheet = workbook.Sheets[sheetName];   

  // Find the column index for 'Delivery' in cellMappings
  var deliveryColumn = getKeyBySubstring(cellMappings, 'Delivery');
  console.log(deliveryColumn);

  // Decode the range of the worksheet
  var range = XLSX.utils.decode_range(worksheet['!ref']);
  let productionDatas = [];

  // Loop through rows starting from the first row after the header
  for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      // Check if the corresponding row in column 'Delivery' has the value 'Delivered' or 'Pick up'
      var cellAddressDelivery = deliveryColumn.charAt(0) + (rowNum + 1); // Dynamically construct column 'Delivery' cell address
      var cellValueDelivery = worksheet[cellAddressDelivery] ? worksheet[cellAddressDelivery].v : '';

      // Check if the value is 'Delivered' or 'Pick up'
      if (cellValueDelivery !== 'Delivered' && cellValueDelivery !== 'Pick up') {
          continue; // Skip this row if it doesn't meet the filter criteria
      }

      // Read values based on the defined cell mappings
      var productionData = {};
      Object.keys(cellMappings).forEach(function(key) {
          var cellAddress = cellMappings[key].charAt(0) + (rowNum + 1); // Dynamically construct cell address based on key
          
          var cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : '';
          productionData[key] = cellValue; // Store value for the current key in productionData
      });

      // Create a new Production instance
      var production = new Production(
          id,
          getKeyBySubstring(productionData, 'Barangay'),
          getKeyBySubstring(productionData, 'Commodity'),
          getKeyBySubstring(productionData, 'Variety'),
          getKeyBySubstring(productionData, 'Area Planted'),
          getKeyBySubstring(productionData, 'Month Planted'),
          getKeyBySubstring(productionData, 'Month Harvested'),
          getKeyBySubstring(productionData, 'Volume of Production'),
          getKeyBySubstring(productionData, 'Cost of Production'),
          String(getKeyBySubstring(productionData, 'Farm Gate Price')),
          getKeyBySubstring(productionData, 'Volume Sold'),
          season,
          monthYear,
      );

      // Check if the record ID already exists in the productions array
      var existingProduction = productions.find(p => p.productionId === production.productionId);

      if (existingProduction) {
          // Remove existing production before adding the new one
          await removeProduction(existingProduction.productionId);
      }
      // Add the new production instance to productions array using addProduction method
      productionDatas.push(production);
  }

  productionDatas[0].addProduction(productionDatas);

  return productions;
}

// Function to find a key in object containing a substring
function getKeyBySubstring(obj, substr) {
  for (let key in obj) {
      if (key.includes(substr)) {
          return obj[key];
      }
  }
  return null;
}