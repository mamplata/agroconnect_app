function sendConcern() {
    // Show the concerns modal when the "Send Feedback" button is clicked
    $('#concernsModal').modal('show');
  }
  
  function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function() {
      var output = document.getElementById('modal-image');
      output.src = reader.result;
      output.alt = 'Image Preview';
    };
    reader.readAsDataURL(event.target.files[0]);
  }
  
  function showPreview() {
    var imageSrc = document.getElementById('modal-image').src;
    if (imageSrc !== '') {
      $('#imageModal').modal('show'); // Show the modal if there is a valid image src
    } else {
      alert('Please select an image to preview.');
    }
  }
  
  $(document).ready(function() {
    // Handle form submission
    $('#uploadForm').on('submit', function(event) {
      event.preventDefault();
      
      let title = $('#title').val();
      let content = $('#content').val();
      let attachment = $('#attachment')[0].files[0];
      let attachmentData = '';
      
      if (attachment) {
        let reader = new FileReader();
        reader.onload = function(e) {
          attachmentData = e.target.result;
          sendContent(title, content, attachmentData);
        };
        reader.readAsDataURL(attachment);
      } else {
        sendContent(title, content);
      }
    });
  
    function sendContent(title, content, attachmentData = ' ') {
      // Retrieve user information from sessionStorage
      const user = JSON.parse(sessionStorage.getItem('user'));
      const userId = user ? user.userId : null; // Ensure userId is obtained safely
  
      $.ajax({
        url: '/api/concerns',  // Laravel API endpoint
        method: 'POST',
        data: {
          userId: userId,
          title: title,
          content: content,
          attachment: attachmentData,
        },
        success: function(response) {
          // Handle success
          $('#uploadForm')[0].reset();
          $('#modal-image').attr('alt', '');
          $('#modal-image').attr('src', '').hide();
          $('#successModal').modal('show'); // Show success modal
          console.log(response);
        },
        error: function(xhr) {
          // Handle error
          console.error('Error saving content:', xhr);
        }
      });
    }
  });
  