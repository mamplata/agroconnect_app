// Record.js
let records = [];

class Record {
  constructor(recordId, userId, name, season, monthYear, fileRecord) {
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
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  updateRecord(updatedRecord) {
    const existingRecord = records.find(b => b.name === updatedRecord.name);

    if (existingRecord && Record.recordId !== updatedRecord.recordId) {
      alert('Record already exists');
      return;
    }

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

function getRecord() {
  // Fetch records from Laravel backend
  $.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });

  // Fetch records from Laravel backend
  $.ajax({
    url: '/api/records', // Endpoint to fetch records
    method: 'GET',
    success: function(response) {
        // Assuming response is an array of records 
        record = response;

        records = record;
        console.log(records);
        console.log('dasd');
    },
    error: function(xhr, status, error) {
        console.error('Error fetching records:', error);
    }
  });
}

getRecord();

function getBarangayNames() {
    // Fetch barangays from Laravel backend
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    // Fetch barangays from Laravel backend
    $.ajax({
        url: '/api/barangays', // Endpoint to fetch barangays
        method: 'GET',
        success: function(response) {
            // Assuming response is an array of barangays 
            const barangays = response;
            barangayArray = barangays;
            console.log(barangays);

            // Populate select dropdown with barangays
            const barangaySelect = $('#barangay-option');
            barangaySelect.empty(); // Clear existing options
            barangays.forEach(b => {
                barangaySelect.append(`<option value="${b.barangayId}">${b.barangayName}</option>`);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching barangays:', error);
        }
    });
}

function searchRecord(recordName) {
  const foundRecords = records.filter(record => record.recordName.includes(recordName));
  return foundRecords;
}

function getBarangayName(id) {

    // Find the barangay object with the matching ID
    const barangay = barangayArray.find(barangay => barangay.barangayId === id);

    // Return the name of the barangay if found, or null if not found
    return barangay ? barangay.barangayName : null;
}

function getBarangayId(name) {

    // Find the barangay object with the matching ID
    const barangay = barangayArray.find(barangay => barangay.barangaName === name);

    // Return the name of the barangay if found, or null if not found
    return barangay ? barangay.barangayId: null;
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
                  <td>${getBarangayName(record.barangayId)}</td>
                  <td>${record.recordName}</td>
                  <td>${record.fieldArea}</td>
                  <td>${record.fieldType}</td>
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
                <td data-barangay-id=${record.barangayId}>${getBarangayName(record.barangayId)}</td>
                <td>${record.recordName}</td>
                <td>${record.fieldArea}</td>
                <td>${record.fieldType}</td>
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
        displayrecords();
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

    // Form submission handler (Add or Update record)
    $('#submitBtn').click(function(event) {
      event.preventDefault();

      var recordId = Number($('#recordId').val());
      var recordName = $('#recordName').val();
      var fieldArea = parseInt($('#fieldArea').val(), 10);
      var fieldType= $('#fieldType').val();
      var barangayId = parseInt($('#barangay-option').val(), 10);
      if (selectedRow !== null) {

        let record = new Record(barangayId, recordId, recordName, fieldArea, fieldType);
        console.log(record);
        record.updateRecord(record);
        selectedRow = null;
        $('#submitBtn').text('Add record');
        $('#cancelBtn').hide(); 
        resetFields();
      } else {
        let record = new Record(barangayId, recordId, recordName, fieldArea, fieldType);
        console.log(record);
        record.createRecord(record);
      }

      // Clear form fields after submission
      $('#recordForm')[0].reset();
      selectedRow = null;
      $('#recordTableBody tr').removeClass('selected-row');
      getRecord();
      displayRecords();
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
          $('#recordName').val(record.recordName);
          $('#fieldArea').val(record.fieldArea);
          $('#fieldType').val(record.fieldType);
          $('#barangay-option').val(record.barangayId);
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
        $('#submitBtn').text('Add Record');
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