let prices = [];

class Price {
  constructor(recordId, cropName, price, season, monthYear) {
    this.recordId = recordId;
    this.cropName = cropName;
    this.price = price;
    this.season = season;
    this.monthYear = monthYear;
  }

  async addPrice(prices) {
    console.log(prices);

    $.ajax({
      url: '/api/prices-batch',
      method: 'POST',
      data: {
        priceData: prices, // Custom key for data
        _token: $('meta[name="csrf-token"]').attr('content')
      },
      success: function(response) {
        console.log(response);
      },
      error: function(xhr) {
        console.error(xhr.responseText);
      }
    });

    getPrices();
  }

  updatePrice(updatedPrice) {
    const existingPrice = prices.find(p => p.recordId === updatedPrice.recordId);

    if (existingPrice && existingPrice.recordId !== updatedPrice.recordId) {
      alert('Price ID already exists');
      return;
    }

    prices = prices.map(price =>
      price.recordId === updatedPrice.recordId ? { ...price, ...updatedPrice } : price
    );

    fetch(`/api/prices/${updatedPrice.recordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPrice),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    getPrices();
  }

  removePrice(prices) {
    $.ajax({
      url: '/api/pricesByRecords',
      method: 'DELETE',
      data: {
        priceData: prices, // Custom key for data
        _token: $('meta[name="csrf-token"]').attr('content')
      },
      success: function(response) {
        console.log(response);
      },
      error: function(xhr) {
        console.error(xhr.responseText);
      }
    });
    getPrices();
  }
}

function getPrices() {
  // Fetch prices from Laravel backend
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  $.ajax({
    url: '/api/prices',
    method: 'GET',
    success: function(response) {
      // Assuming response is an array of prices [{...fields...}, ...]
      prices = response;
      console.log(prices);
    },
    error: function(xhr, status, error) {
      console.error('Error fetching prices:', error);
    }
  });
}

getPrices();

function searchPrice(cropName) {
  const foundPrices = prices.filter(price => price.cropName.includes(cropName));
  return foundPrices;
}

// Function to build and return table rows as an array of Price instances
async function processPriceData(workbook, cellMappings, id, season, monthYear) {
  // Assuming workbook is already loaded or passed as a parameter

  // Select the sheet you want to read from
  var sheetName = workbook.SheetNames[0]; // Assuming the first sheet
  var worksheet = workbook.Sheets[sheetName];   

  // Find the column index for 'Commodity' in cellMappings
  var commodityColumn = getKeyBySubstring(cellMappings, 'Commodity');
  var priceColumn = getKeyBySubstring(cellMappings, 'Price');
  console.log(commodityColumn, priceColumn);

  // Decode the range of the worksheet
  var range = XLSX.utils.decode_range(worksheet['!ref']);
  let priceDatas = [];

  // Loop through rows starting from the first row after the header
  for (var rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
    // Read values based on the defined cell mappings
    var priceData = {};
    Object.keys(cellMappings).forEach(function(key) {
      var cellAddress = cellMappings[key].charAt(0) + (rowNum + 1); // Dynamically construct cell address based on key
      
      var cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : '';
      priceData[key] = cellValue; // Store value for the current key in priceData
    });

    // Create a new Price instance
    var price = new Price(
      id,
      getKeyBySubstring(priceData, 'Commodity'),
      getKeyBySubstring(priceData, 'Price'),
      season,
      monthYear
    );

    // Add the new price instance to prices array using addPrice method
    priceDatas.push(price);
  }

  // Check if the record ID already exists in the prices array
  var existingPrice = prices.find(p => p.recordId === priceDatas[0].recordId);

  if (existingPrice) {
    // Remove existing price before adding the new one
    await priceDatas[0].removePrice(priceDatas);
    console.log('Existing price removed.');
  }

  priceDatas[0].addPrice(priceDatas);
  return prices;
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
