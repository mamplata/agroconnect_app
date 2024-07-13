// Production.js
let productions = [];

class Production {
  constructor(productionId, firstName, lastName, productionname, role, password = '') {
    this.productionId = productionId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.productionname = productionname;
    this.role = 'agriculturist';
    this.password = password;
  }

  createProduction(production) {
    const existingProduction = productions.find(u => u.productionname === production.productionname);
    if (existingProduction) {
      alert('Productionname already exists');
      return;
    }

    fetch('/api/productions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(production),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  updateProduction(updatedProduction) {
    const existingProduction = productions.find(u => u.productionname === updatedProduction.productionname);

    if (existingProduction && existingProduction.productionId !== updatedProduction.productionId) {
      alert('Productionname already exists');
      return;
    }

    productions = productions.map(production =>
      production.productionId === updatedProduction.productionId ? { ...production, ...updatedProduction } : production
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

  // Fetch productions from Laravel backend
  $.ajax({
    url: '/api/productions', // Endpoint to fetch productions
    method: 'GET',
    success: function(response) {
        // Assuming response is an array of productions [{firstName, lastName, productionname, role}, ...]
        production = response;

        productions = production;
        console.log(productions);
    },
    error: function(xhr, status, error) {
        console.error('Error fetching productions:', error);
    }
  });
}

getProduction();

function searchProduction(productionname) {
  const foundProductions = productions.filter(production => production.productionname.includes(productionname));
  return foundProductions;
}



