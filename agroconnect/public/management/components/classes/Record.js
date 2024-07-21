// Record.js
let records = [];

class Record {
  constructor(recordId, userId, name, season, monthYear, type, fileRecord = '') {
    this.recordId = recordId;
    this.userId = userId;
    this.name = name;
    this.season = season;
    this.type = type;
    this.monthYear = monthYear;
    this.fileRecord = fileRecord;
  }

  async createRecord(record) {
    const existingRecord = records.find(b => b.monthYear === record.monthYear && b.type === record.type);
    if (existingRecord) {
      alert('Record with the same type already exists');
      return;
    }

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
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

async updateRecord(updatedRecord) {
    const existingRecord = records.find(b => b.monthYear === updatedRecord.monthYear && b.type !== updatedRecord.type);
    if (existingRecord) {
      alert('Record with the same type already exists');
      return;
    }

    records = records.map(record =>
      record.recordId === updatedRecord.recordId ? { ...record, ...updatedRecord } : record
    );

    try {
      const response = await fetch(`/api/records/${updatedRecord.recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRecord),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      const data = await response.json();
      console.log('Success:', data);
      return data.recordId;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
}

  removeRecord(recordId) {
    fetch(`/api/records/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (response.status === 204) {
          records = records.filter(record => record.recordId !== record);
          console.log(`Record with ID ${recordId} deleted.`);
        } else if (response.status === 404) {
          console.error(`Record with ID ${recordId} not found.`);
        } else {
          console.error(`Failed to delete record with ID ${recordId}.`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

let links = '';

function getRecord(dataType) {
  // Fetch records from Laravel backend
  $.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });
  
  function getFormattedBase64FileSize(base64String) {
    // Function to calculate the file size of a base64 string
    function getBase64FileSize(base64String) {
        let padding = 0;
        if (base64String.endsWith('==')) padding = 2;
        else if (base64String.endsWith('=')) padding = 1;

        let base64StringLength = base64String.length;
        return (base64StringLength * 3 / 4) - padding;
    }

    // Function to format the file size
    function formatFileSize(size) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;
        let formattedSize = size;

        while (formattedSize >= 1024 && unitIndex < units.length - 1) {
            formattedSize /= 1024;
            unitIndex++;
        }

        return `${formattedSize.toFixed(2)} ${units[unitIndex]}`;
    }

    const fileSize = getBase64FileSize(base64String);
    return formatFileSize(fileSize);
}

$.ajax({
  url: `/api/records/${dataType}`, // Endpoint to fetch records
  method: 'GET',
  success: function(response) {
      console.log('Response:', response);
      
      // Assuming response is an array of records
      if (Array.isArray(response) && response.length > 0) {
        const recordsArray = response; // Store the array of records in recordsArray
        records = [];
        // Example: Accessing and logging properties of each record
        recordsArray.forEach(record => {

            // Calculate and log the file size of the base64-encoded fileRecord
            let fileSize = getFormattedBase64FileSize(record.fileRecord);
            record.fileSize = fileSize; 

            // Convert the base64-encoded fileRecord to a downloadable link
            const base64String = record.fileRecord;
            const mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // MIME type for Excel files
            const link = `data:${mimeType};base64,${base64String}`;

            // Create an anchor tag with the download link
            const anchorTag = `<a class="text-primary text-decoration-underline" onclick="confirmDownload('${link}', '${record.name}.xlsx')">${record.name} ${record.monthYear}</a>`;

            record.downloadLink = anchorTag;

            records.push(record);
        });
        
      } else {
        console.log('Expected an array of records, but received:', response);
        records = [];
        console.log('Response:', records);
      }
  },
  error: function(xhr, status, error) {
      console.error('Error fetching records:', error);
  }
});
}

  // Function to confirm download
  function confirmDownload(link, filename) {
    const confirmed = confirm('Are you sure you want to download this file?');
    if (confirmed) {
      const a = document.createElement('a');
      a.href = link;
      a.download = filename;
      a.click();
    }
  }

function searchRecord(recordName) {
  const foundRecords = records.filter(record => record.recordName.includes(recordName));
  return foundRecords;
}

function initializeMethodsRecord(dataType) {

   getRecord(dataType);

    var selectedRow = null;
    var pageSize = 5;
    var currentPage = 1;
    var record = null;

    async function displayRecords(recordName = null) {

      // Simulate a delay of 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));

      $('#recordTableBody').empty();
    
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = startIndex + pageSize;
      if (recordName) {
        // Display a single record if recordName is provided
          const foundrecords = searchrecord(recordName);
          if (foundrecords.length > 0) {
            foundrecords.forEach(record => {
              $('#recordTableBody').append(`
                <tr data-index=${record.recordId}>
                    <td style="display: none;">${record.recordId}</td>
                    <td>${record.downloadLink}</td>
                    <td>${record.fileSize}</td>
                </tr>
              `);
            });
          } else {
            // Handle case where recordName is not provided
            $('#recordTableBody').append(`
              <tr>
                <td colspan="4">record not found!</td>
              </tr>
            `)
          }
      } else {
        // Display paginated records if no recordName is provided
        for (var i = startIndex; i < endIndex; i++) {
          if (i >= records.length) {
            break;
          }
          var record = records[i];
          $('#recordTableBody').append(`
            <tr data-index=${record.recordId}>
                <td style="display: none;">${record.recordId}</td>
                <td>${record.downloadLink}</td>
                <td>${record.fileSize}</td>
            </tr>
          `);
        }
      }
    }

    // Display initial records
    displayRecords();

    $('#search').change(function() {
      let recordName = $('#search').val();
      displayrecords(recordName);
    });

    // Pagination: Previous button click handler
    $('#prevBtn').click(function() {
      if (currentPage > 1) {
        currentPage--;
        displayRecords();
      }
    });

    // Pagination: Next button click handler
    $('#nextBtn').click(function() {
      var totalPages = Math.ceil(records.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        displayRecords();
      }
    });

    function getSeason(month) {
      console.log(month);
      month = month.toLowerCase();
      
      // Define the dry and wet seasons
      const drySeason = ['march', 'april', 'may', 'june', 'july', 'august'];
      const wetSeason = ['september', 'october', 'november', 'december', 'january', 'february'];

      // Determine the season based on the month
      if (drySeason.includes(month)) {
          return 'Dry';
      } else if (wetSeason.includes(month)) {
          return 'Wet';
      } else {
          return 'Invalid month';
      }
    }
    
    $('#submitBtn').click(async function(event) {
      event.preventDefault();
    
      let users = JSON.parse(localStorage.getItem('user'));
      var recordId = Number($('#recordId').val());
      var userId = users.userId;
      var name = $('#name').val();
      var month = $('#monthPicker select').val(); // input is inside #monthPicker
      var year = $('#yearPicker input').val(); // input is inside #yearPicker
      var season = getSeason(month);
      var type = dataType;
      var monthYear = `${month} ${year}`;
    
      var fileInput = document.getElementById('fileRecord');
      var file = fileInput.files[0];
      let terms = getSearchTerms(dataType);
    
      try {
        if (file) {
          // Validate the search terms asynchronously
          let isValid = await validateSearchTerms(file, terms[0]);
          
          if (!isValid) {
            alert('The file is not a valid format.');
            return;
          }
      
          const arrayBuffer = await file.arrayBuffer();
          const blob = new Blob([arrayBuffer], { type: file.type });
          
          // Convert Blob to base64 string
          const readerBase64 = new FileReader();
          readerBase64.onload = function(e) {
            const fileRecord = e.target.result.split(',')[1]; // Extract base64 string
            
            // Prepare the record object
            let record = new Record(recordId, userId, name, season, monthYear, type, fileRecord);
            
            // Create or update record based on the selectedRow
            let recordPromise = selectedRow !== null ? 
              record.updateRecord(record) :
              record.createRecord(record);
            
            recordPromise.then(id => {
              processDataBasedOnType(dataType, terms[0], terms[1], terms[2], terms[3], file, id, season, monthYear);
              // Reset form and update UI
              $('#lblUpload').text('Upload File:');
              $('#submitBtn').text('Add record');
              $('#cancelBtn').hide();
              $('#recordForm')[0].reset();
              $('#fileRecord').attr('required', 'required');
              getRecord(dataType);
              displayRecords();
              resetFields();
              selectedRow = null;
            }).catch(error => {
              console.error("Error creating/updating record:", error);
            });
          };
          
          readerBase64.readAsDataURL(blob);
        } else {
          if (selectedRow !== null) {
            let record = new Record(recordId, userId, name, season, monthYear, type, '');
            record.updateRecord(record).then(() => {
              // Reset form and update UI
              $('#lblUpload').text('Upload File:');
              $('#submitBtn').text('Add record');
              $('#cancelBtn').hide();
              $('#recordForm')[0].reset();
              $('#fileRecord').attr('required', 'required');
              getRecord(dataType);
              displayRecords();
              resetFields();
              selectedRow = null;
            }).catch(error => {
              console.error("Error updating record:", error);
            });
          } else {
            alert('Please select a file first.');
          }
        }
      } catch (error) {
        console.error('Error during file validation:', error);
      }
      
    });
    

    function getSearchTerms(dataType) {
      let terms;
      let terms2;
      let methodName;
      let methodName2;
      switch (dataType) {
        case 'production':
          terms = ["Barangay", "Commodity", "Variety", "Area Planted", "Month Planted", "Month Harvested", "Volume of Production", "Cost of Production", "Farm Gate Price", "Volume Sold", "Mode of Delivery"];
          methodName = processProductionData;
          break;
        case 'price':
          terms = ["Commodity", "Price"];
          methodName = processPriceData;
          break;
        case 'pestDisease':
          terms = ["Farm Location" ,"Crops Planted", "Pest Observed"];
          terms2 = ["Farm Location", "Crops Planted", "Disease Observed"];
          methodName = processPestData;
          methodName2 = processDiseaseData;
          break;
        case 'soilHealth':
          terms = ["Barangay", "Farmer", "Nitrogen", "Phosphorus", "Potassium", "pH", "General Fertility", "Recommendations"];
          methodName = processSoilHealthData;
          break;
        default:
          console.error("Unknown data type");
      }

      return [terms, terms2, methodName, methodName2];
    }

    function validateSearchTerms(file, searchTerms) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
          try {
            const data = event.target.result;
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
    
            // Normalize the search terms
            const normalizedSearchTerms = searchTerms.map(normalizeString);
    
            // Create a Set to keep track of found search terms
            const foundTerms = new Set();
    
            // Iterate through each sheet in the workbook
            for (let sheetName of workbook.SheetNames) {
              const worksheet = workbook.Sheets[sheetName];
              const range = XLSX.utils.decode_range(worksheet['!ref']);
    
              // Iterate through each row in the sheet
              for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
                // Iterate through each cell in the row
                for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
                  const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
                  const cell = worksheet[cellAddress];
    
                  if (cell && cell.v) {
                    const cellValue = cell.v;
                    if (cellMatchesSearchTerms(cellValue, normalizedSearchTerms)) {
                      normalizedSearchTerms.forEach(term => {
                        if (cellMatchesSearchTerms(cellValue, [term])) {
                          foundTerms.add(term);
                        }
                      });
                    }
                  }
                }
              }
            }
    
            console.log(foundTerms);
            // Check if all search terms are found
            const allTermsFound = normalizedSearchTerms.every(term => foundTerms.has(term));
            resolve(allTermsFound);
          } catch (error) {
            reject(error);
          }
        };
    
        reader.onerror = function(event) {
          reject(event.target.error);
        };
    
        reader.readAsArrayBuffer(file);
      });
    }
    

    function processDataBasedOnType(dataType, searchTerms, searchTerms2, methodName, methodName2, file, id, season, monthYear) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        if (dataType === 'pestDisease') {
          extractData(workbook, searchTerms, methodName, id, season, monthYear);
          extractData(workbook, searchTerms2, methodName2, id, season, monthYear);

        } else {
          extractData(workbook, searchTerms, methodName, id, season, monthYear);
        }     
      };
      reader.readAsBinaryString(file);
    }

    // Normalize search term: remove whitespace and convert to lowercase
    function normalizeString(str) {
      if (typeof str !== 'string') {
          str = String(str);
      }
      return str.toLowerCase();
    }

    // Check if a cell matches any search term (case insensitive and whole word match)
    function cellMatchesSearchTerms(cellValue, searchTerms) {
      const normalizedCellValue = normalizeString(cellValue);
      return searchTerms.some(term => {
          const normalizedTerm = normalizeString(term);
          // Create a regex to match whole words only
          const regex = new RegExp(`\\b${normalizedTerm}\\b`, 'i');
          return regex.test(normalizedCellValue);
      });
    }

    // Extract data from the workbook and search for terms
    function extractData(workbook, searchTerms, processFunction, id, season, monthYear) {
      // Normalize the search terms
      let headers = {};
      const normalizedSearchTerms = searchTerms.map(normalizeString);

      // Iterate through each sheet in the workbook
      workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const range = XLSX.utils.decode_range(worksheet['!ref']);
  
          // Iterate through each row in the sheet
          for (let rowNum = (range.s.r + 4); rowNum <= range.e.r; rowNum++) {
              // Iterate through each cell in the row
              for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
                  const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
                  const cell = worksheet[cellAddress];
                  
                  if (cell && cell.v && cellMatchesSearchTerms(cell.v, normalizedSearchTerms)) {
                      // Pass additional data to display function
                      headers[cell.v] = cellAddress;
                  }
              }
          }
      });

      // Call the specific process function based on the data type
      const rowsArray = processFunction(workbook, headers, id, season, monthYear);
    }

    function resetFields() {
      // Reset UI states
      $('#editBtn').prop('disabled', true);
      $('#deleteBtn').prop('disabled', true);
      selectedRow = null;
      $('#recordTableBody tr').removeClass('selected-row');
    }

    $('#editBtn').click(function() { 
        // Open the delete modal
        $('#dataEdit').text('record');
        $('#editModal').modal('show');

        // Edit button click handler
        $('#confirmEditBtn').click(function() {
          $('#editModal').modal('hide');
          $('#cancelBtn').show();
          $('#recordId').val(record.recordId);
          $('#name').val(record.name);
          // Assuming record.monthYear is like 'July 2024'
          var monthYear = record.monthYear;

          // Split the monthYear into month and year
          var parts = monthYear.split(' ');
          var month = parts[0]; // 'July'
          var year = parts[1]; // '2024'

          // Set the values in the input fields
          $('#monthPicker select').val(month);
          $('#yearPicker input').val(year);
          $('#fileRecord').removeAttr('required');
          $('#lblUpload').text('Insert New File (optional):');
          $('#submitBtn').text('Update Record');
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
        $('#recordForm')[0].reset();
        $('#lblUpload').text('Upload File:');
        $('#submitBtn').text('Add Record');
        $('#fileRecord').attr('required', 'required');
        $('#cancelBtn').hide();
        $('#recordTableBody tr').removeClass('selected-row');
      }
    });

  // Delete button click handler
  $('#deleteBtn').click(function() {
    // Open the delete modal
    $('#dataDelete').text('record');
    $('#deleteModal').modal('show');

    // Click handler for modal's delete button
    $('#confirmDeleteBtn').click(function() {
      // Close the modal
      $('#deleteModal').modal('hide');
        recordToDelete = new Record();
        recordToDelete.removeRecord(record.recordId);
        getRecord(dataType);
        displayRecords();
        resetFields();
      });

    $('#cancelDelete').click(function() {
      resetFields();
    });
  });

// Row click handler (for selecting rows)
$('#recordTableBody').on('click', 'tr', function() {
  var $this = $(this);
  var recordId = $this.data('index');
  record = records.find(u => u.recordId === recordId);
  selectedRow = recordId;
  // Highlight selected row
  if (selectedRow !== null) {
  $('#recordTableBody tr').removeClass('selected-row');
  $('#recordTableBody tr').filter(function() {
    return parseInt($(this).find('td:eq(0)').text(), 10) === selectedRow;
  }).addClass('selected-row');
  $('#editBtn').prop('disabled', false);
  $('#deleteBtn').prop('disabled', false);
} else {
  $('#recordTableBody tr').removeClass('selected-row');
}

});
}