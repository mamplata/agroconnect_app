$(document).ready(function() {
    // Check if the user is logged in
    if (!sessionStorage.getItem('isLoggedIn')) {
        // If not logged in, redirect to login page
        window.location.href = '/login';
    } else {
        // Show content if logged in

        // Logout functionality
        $('#logoutBtn').click(function() {
            // Clear localStorage
            localStorage.removeItem('isLoggedIn');
            // Redirect to login page
            window.location.href = '/login';
        });
    }
});

// Function to fetch and display Excel content as HTML table
function displayExcel() {
    var selectedValue = document.getElementById("filterSelect").value; // Updated here
    var numData = document.getElementById('numData').value;

    if (numData ===  '') {
        alert("Please enter number of data");
        return;
    }

    console.log(selectedValue);
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', `components/${selectedValue}/data.php`, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            display();
        }
    };

    xhr.send('numData=' + encodeURIComponent(numData));

    // Update download button event listener
    document.getElementById('downloadButton').addEventListener('click', function() {
        window.location.href = `components/${selectedValue}/download.php`;
    });
}

// Function to display Excel content as HTML table
function display() {
    var selectedValue = document.getElementById("filterSelect").value; // Updated here
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `components/${selectedValue}/display.php`, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var excelHtml = xhr.responseText;
            document.getElementById('excelDisplay').innerHTML = excelHtml;
        }
    };
    
    xhr.send();
}
