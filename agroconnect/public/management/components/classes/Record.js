// Record.js
let records = [];

class Record {
  constructor(recordId, userId, name, season, monthYear, fileRecord = '') {
    this.recordId = recordId;
    this.userId = userId;
    this.name = name;
    this.season = season;
    this.monthYear = monthYear;
    this.fileRecord = fileRecord;
  }

  createRecord(record) {
    const existingRecord = records.find(b => b.name === record.name);
    if (existingRecord) {
      alert('Record already exists');
      return;
    }

    fetch('/api/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    })
      .then(response => {
        console.log('Response Status:', response.status);
        return response.json(); // Attempt to parse JSON
      })
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
        // Log the entire response for debugging purposes
        response.text().then(text => {
          console.log('Full Response:', text);
        });
      });
  }

  updateRecord(updatedRecord) {
    const existingRecord = records.find(r => r.name === updatedRecord.name);

    if (existingRecord && existingRecord.recordId !== updatedRecord.recordId) {
      alert('Record already exists');
      return;
    }

    console.log(updatedRecord.fileRecord);

    records = records.map(record =>
        record.recordId === updatedRecord.recordId ? { ...record, ...updatedRecord } : records
    );

    fetch(`/api/records/${updatedRecord.recordId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedRecord),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
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

function getRecord() {
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

// Fetch records from Laravel backend
$.ajax({
  url: '/api/records', // Endpoint to fetch records
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
        console.error('Expected an array of records, but received:', response);
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

getRecord();

function searchRecord(recordName) {
  const foundRecords = records.filter(record => record.recordName.includes(recordName));
  return foundRecords;
}

function initializeMethodsRecord() {
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

    function getSeason(month) {;
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
    
    // Form submission handler (Add or Update record)
    $('#submitBtn').click(function(event) {
      event.preventDefault();
      
      let users = JSON.parse(localStorage.getItem('user'));
      var recordId = Number($('#recordId').val());
      var userId = users.userId;
      var name = $('#name').val();
      var month = $('#monthPicker input').val(); // input is inside #monthPicker
      var year = $('#yearPicker input').val(); // input is inside #yearPicker
      var season = getSeason(month);
      var monthYear = `${month} ${year}`;
      
      var fileInput = document.getElementById('fileRecord');
      var file = fileInput.files[0];
      
      if (file) {
          const reader = new FileReader();
          
          reader.onload = function(event) {
              const arrayBuffer = event.target.result;
              const blob = new Blob([arrayBuffer], { type: file.type });
              
              // Convert Blob to base64 string
              const readerBase64 = new FileReader();
              readerBase64.onload = function(e) {
                  const fileRecord = e.target.result.split(',')[1]; // Extract base64 string
                  
                  if (selectedRow !== null) {
                      let record = new Record(recordId, userId, name, season, monthYear, fileRecord);
                      record.updateRecord(record); // Assuming this method updates the record
                      selectedRow = null;
                      $('#lblUpload').text('Upload File:');
                      $('#submitBtn').text('Add record');
                      $('#cancelBtn').hide();
                      resetFields();
                  } else {
                      let record = new Record(recordId, userId, name, season, monthYear, fileRecord);
                      record.createRecord(record); // Assuming this method creates a new record
                  }
              };
              
              readerBase64.readAsDataURL(blob);
          };
          reader.readAsArrayBuffer(file);
          $('#lblUpload').text('Upload File:');
          $('#submitBtn').text('Add record');
          $('#cancelBtn').hide();
           // Clear form fields after submission
          $('#recordForm')[0].reset();
          $('#fileRecord').attr('required', 'required');
          getRecord();
          displayRecords();
      } else {
          if (selectedRow !== null) {
            let record = new Record(recordId, userId, name, season, monthYear, '');
            record.updateRecord(record); // Assuming this method updates the record
            selectedRow = null;
            $('#lblUpload').text('Upload File:');
            $('#submitBtn').text('Add record');
            $('#cancelBtn').hide();
             // Clear form fields after submission
            $('#recordForm')[0].reset();
            $('#fileRecord').attr('required', 'required');
            getRecord();
            displayRecords();
            resetFields();
        } else {
            alert('Please select a file first.');
        }
      }
    });

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
          $('#monthPicker input').val(month);
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
        getRecord();
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