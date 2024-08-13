import { getCrop, getProduction, getPrice, getPest, getDisease, getProductions, getFarmer, getDataEntries, getRecord, getUsers, getBarangay, getConcerns} from '../../../js/fetch.js';
import { countTotalPlanted, averageVolumeProduction, averagePrice, countPestOccurrence, countDiseaseOccurrence, priceIncomePerHectare, benefitPerHectare, getCropData } from '../../../js/statistics.js';

export default function initDashboard() {
  
  $(document).ready(function() {
    // Retrieve user role from sessionStorage
    var user = JSON.parse(sessionStorage.getItem('user'));
    var role = user ? user.role : 'agriculturist'; 
  
    // Generate the dashboard HTML with styles included
    var dashboardHtml = `
      <style>
        .card-box {
          border-radius: 1em;
          margin-bottom: 2em;
          color: white;
          background-color: #008000; /* Green background for cards */
          cursor: pointer; /* Pointer cursor for indicating clickability */
        }
        .card-box .card-body {
          font-size: 1.5em;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: around;
          height: 5em;
          flex-direction: column;
        }
        .card-title {
          margin-bottom: 1em;
          font-size: 0.7em;
          text-align: center;
        }
        .card-box a {
          color: white;
          text-decoration: none;
        }
        .equal-height {
          display: flex;
          align-items: stretch;
        }
        .equal-height > div {
          display: flex;
          flex-direction: column;
        }
        .form-row > .form-group {
          margin-right: 0.5em;
          margin-left: 0.5em;
        }
        #available {
          text-align: center;
        }
        .underline-link {
          text-decoration: underline;
          color: #ffbd40; /* Color for links */
          font-weight: bold; /* Make the link text bold */
          font-style: italic; /* Italicize the link text */
          transition: color 0.3s, text-decoration-color 0.3s; /* Smooth transition for color changes */
        }
        .underline-link:hover {
          color: #f57f17; /* Darker shade on hover */
          text-decoration-color: #f57f17; /* Change underline color on hover */
          text-decoration-thickness: 2px; /* Make underline thicker on hover */
        }
        .underline-link:active {
          color: #e64a19; /* Even darker shade on active */
        }

        .form-control {
            padding-left: 20px;
            background-color: #B1BA4D;
            border-radius: 5px;
            text-align: center;
            color: #fff;
            font-weight: 600;
        }
      </style>
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">Dashboard</h1>
      </div>
      <div class="row d-flex justify-content-center">`;

      if (role === 'admin') {
        dashboardHtml += `
        <div class="col-md-3">
            <div class="card card-box" data-link="#manage-users">
              <div class="card-body">
                <h5 class="card-title">Users</h5>
                <p id="users-count">0</p>
              </div>
            </div>
          </div>`;
      }

        dashboardHtml += `
        <div class="col-md-3">
          <div class="card card-box" data-link="#maintenance" data-value="farmer">
            <div class="card-body">
              <h5 class="card-title">Farmers</h5>
              <p id="farmers-count">0</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-box" data-link="#maintenance" data-value="barangay">
            <div class="card-body">
              <h5 class="card-title">Barangays</h5>
              <p id="barangays-count">0</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card card-box" data-link="#maintenance" data-value="supplyMarket">
            <div class="card-body">
              <h5 class="card-title">Records</h5>
              <p id="records-count">0</p>
            </div>
          </div>
        </div>
      `;

    // Append new cards for Data Entries, Downloads, and Concerns only if user is admin
    if (role === 'admin') {
      dashboardHtml += ` 
          <div class="col-md-3">
            <div class="card card-box" data-link="#data-entries">
              <div class="card-body">
                <h5 class="card-title">Data Entries</h5>
                <p id="data-entries-count">0</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card card-box no-link">
              <div class="card-body">
                <h5 class="card-title">Downloads</h5>
                <p id="downloads-count">0</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card card-box" data-link="#concerns">
              <div class="card-body">
                <h5 class="card-title">Concerns & Issues</h5>
                <p id="concerns-count">0</p>
              </div>
            </div>
          </div>
      `;
    }
  
    dashboardHtml += `
        </div>
        <div class="row equal-height mt-4">
          <div class="col-md-7">
            <form class="form-row justify-content-center mb-3">
              <div class="form-group col-md-4">
                <label for="season">Season:</label>
                <select id="season" class="form-control">
                  <option value="dry">Dry</option>
                  <option value="wet">Wet</option>
                </select>
              </div>
              <div class="form-group col-md-4">
                <label for="type">Type:</label>
                <select id="type" class="form-control">
                  <option value="Vegetables">Vegetable</option>
                  <option value="Fruits">Fruits</option>
                </select>
              </div>
              <div class="form-group col-md-4">
                <label for="crop">Crop:</label>
                <select id="crop" class="form-control">
                  <!-- Options will be dynamically added here -->
                </select>
              </div>
              <div class="form-group col-md-4">
                <label for="category">Category:</label>
                <select id="category" class="form-control">
                  <option value="total_planted">Total Planted</option>
                  <option value="production_volume">Production Volume Per Hectare</option>
                  <option value="price">Price</option>
                  <option value="pest_occurrence">Pest Occurrence</option>
                  <option value="disease_occurrence">Disease Occurrence</option>
                  <option value="price_income_per_hectare">Price Income per Hectare</option>
                  <option value="benefit_per_hectare">Benefit Per Hectare</option>
                </select>
              </div>
            </form>
            <div class="row justify-content-center">
              <div id="available" class="col text-center">
                <canvas id="totalPerYearChart" width="400" height="200"></canvas>
              </div>
              <div id="unavailable" class="col text-center mb-5">
                <p class="h4">We're sorry, but there is no data available at the moment.</p>
              </div>
            </div>
            <div class="text-center mt-3">
              <a href="../seasonal-trends" class="underline-link" target="_blank">View Seasonal Trends</a>
            </div>
          </div>
          <div class="col-md-4">
            <div class="container mt-4">
              <div class="mb-4">
                <div class="row">
                  <div class="col-md-12">
                    <div class="form-group">
                      <label for="seasonSelect">Season</label>
                      <select class="form-control" id="seasonSelect">
                        <option value="Dry">Dry</option>
                        <option value="Wet">Wet</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="form-group">
                      <label for="typeSelect">Type</label>
                      <select class="form-control" id="typeSelect">
                        <option value="Vegetables">Vegetables</option>
                        <option value="Fruits">Fruits</option>
                        <option value="Rice">Rice</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <table class="table table-bordered" id="cropsTable">
                <thead>
                  <div class="text-center mb-3">
                     <a href="../top-crops" class="underline-link" target="_blank">View Top Crops</a>
                  </div>
                  <tr>
                    <th>Commodity</th>
                    <th>Variety</th>                                       
                  </tr>
                </thead>
                <tbody>
                  <!-- Table rows will be dynamically added here -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  
    // Set the HTML content
    $('#main-content').html(dashboardHtml);
  });
  


  // Document ready function
  $(document).ready(async function() {
      initializeDashboard();
      updateCropOptions().then(() =>  handleCategoryChange());

      // Attach event listeners for changes
      $('#type').on('change', function() {
          updateCropOptions().then(() => handleCategoryChange());
      });
      $('#category, #crop, #season').on('change', function() {
          handleCategoryChange();
      });
  });

  // Initialize dashboard with dummy data
  async function initializeDashboard() {
    try {
        // Fetch data asynchronously
        let [farmers, records, users, barangays, concerns, dataEntries] = await Promise.all([
            getFarmer(),
            getRecord(),
            getUsers(),
            getBarangay(),
            getConcerns(),
            getDataEntries()
        ]);

        // Initialize with real data or dummy data where applicable
        var dashboardData = {
            users: users.length,
            farmers: farmers.length,
            barangays: barangays.length,
            records: records.length,
            dataEntries: dataEntries,
            downloads: 300, // Keep a dummy value for now
            concerns: concerns.length
        };

        // Update dashboard with the fetched data
        $('#users-count').text(dashboardData.users);
        $('#farmers-count').text(dashboardData.farmers);
        $('#barangays-count').text(dashboardData.barangays);
        $('#records-count').text(dashboardData.records);
        $('#data-entries-count').text(dashboardData.dataEntries);
        $('#downloads-count').text(dashboardData.downloads);
        $('#concerns-count').text(dashboardData.concerns);

       if (role === 'admin') {
          $('.card-box').click(function() {
            // Check if the card has the no-link class
            if (!$(this).hasClass('no-link')) {
                var link = $(this).data('link');
                var optionValue = $(this).data('value'); // Get the value from data-value attribute
        
                if (link) {
                    // Define the value for fromDashboard
                    if(link === "#maintenance") {
                      var fromDashboard = true;
                      // Store values in sessionStorage
                      sessionStorage.setItem('fromDashboard', fromDashboard);
                      sessionStorage.setItem('optionValue', optionValue);
                    }
        
                    // Perform the redirection
                    window.location.href = link;
                }
            }
        });
       }
      
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}


  async function getUniqueCropNames() {
      try {
          const productions = await getProductions();
          const uniqueCropNames = [...new Set(productions.map(p => p.cropName.toLowerCase()))];
          return uniqueCropNames;
      } catch (error) {
          console.error('Failed to fetch production data:', error);
          return [];
      }
  }

  async function updateCropOptions() {
      const type = $('#type').val().toLowerCase();
      let options = '';

      try {
          const crops = await getCrop(type);
          const uniqueCropNames = await getUniqueCropNames();

          if (crops.length > 0) {
              const filteredCrops = crops.filter(crop => uniqueCropNames.includes(crop.cropName.toLowerCase()));
              console.log('Filtered crops:', filteredCrops); // Debug: Log filtered crops
              options = filteredCrops.length > 0 
                  ? filteredCrops.map(crop => `<option value="${crop.cropName.toLowerCase()}">${crop.cropName}</option>`).join('')
                  : '<option value="">No crops available</option>';
          } else {
              options = '<option value="">No crops available</option>';
          }
      } catch (error) {
          console.error('Failed to update crop options:', error);
          options = '<option value="">Error loading crops</option>';
      }

      $('#crop').html(options);
  }

  // Function to handle category change and display results
  async function handleCategoryChange() {
      const season = $('#season').val();
      const type = $('#type').val();
      const crop = $('#crop').val();
      const category = $('#category').val();

      let categoryText;
      let dataset = [];
      let data = [];
      let key = [];
      
      try {
          switch (category) {
              case 'total_planted':
                  categoryText = 'Total Planted';
                  key = ["totalPlanted"];
                  data = await getProduction(crop, season);
                  dataset = countTotalPlanted(data);
                  console.log(data);
                  break;
              case 'production_volume':
                  categoryText = 'Production Volume Per Hectare';
                  key = ["volumeProduction", "totalVolume", "totalArea"];
                  data = await getProduction(crop, season);
                  dataset = averageVolumeProduction(data);
                  break;
              case 'price':
                  categoryText = 'Price';
                  key = ["price"];
                  data = await getPrice(crop, season);
                  dataset = averagePrice(data);
                  break;
              case 'pest_occurrence':
                  categoryText = 'Pest Occurrence';
                  key = ["pestOccurrence"];
                  data = await getPest(crop, season);
                  dataset = countPestOccurrence(data);
                  break;
              case 'disease_occurrence':
                  categoryText = 'Disease Occurrence';
                  key = ["diseaseOccurrence"];
                  data = await getDisease(crop, season);
                  dataset = countDiseaseOccurrence(data);
                  break;
              case 'price_income_per_hectare':
                  categoryText = 'Price Income per Hectare';
                  key = ["incomePerHectare", "totalArea", "totalIncome"];
                  data = await getProduction(crop, season);
                  dataset = priceIncomePerHectare(data);
                  break;
              case 'benefit_per_hectare':
                  categoryText = 'Benefit per Hectare';
                  key = ["benefitPerHectare", "totalArea", "totalIncome", "totalProductionCost"];
                  data = await getProduction(crop, season);
                  dataset = benefitPerHectare(data);
                  break;
              default:
                  categoryText = 'Category not recognized';
          }
          
          // Clear the previous chart before generating a new one
          if(dataset.length !== 0) {
              $('#unavailable').hide();
              $('#available').show();
              const charts = generateTrends(dataset, categoryText, key);
              displayTrends(charts);  
          }else {
              $('#available').hide();
              $('#unavailable').show();
          }
                
        
      } catch (error) {
          console.error('Error handling category change:', error);
      }
  }

  // Function to generate trends based on dataset
  function generateTrends(dataset, label, keys) {
      if (!dataset.length) { 
          return { barChartConfig: null }; // Return null configurations if the dataset is empty 
      }
      

      const uniqueSeasons = Array.from(new Set(dataset.map(entry => entry.season)));
      const season = uniqueSeasons[0] || 'Unknown';

      const uniqueYears = Array.from(new Set(dataset.map(entry => entry.monthYear.split(' ')[1])));
      uniqueYears.sort((a, b) => a - b);

      const totalsPerYear = uniqueYears.map(year => {
          var total = dataset
              .filter(entry => entry.monthYear.endsWith(year))
              .reduce((total, entry) => total + entry[keys[0]], 0);
          return total.toFixed(2);
      });

      const barChartData = {
          labels: uniqueYears,
          datasets: [
              {
                  label: `${label} Per Year`,
                  data: totalsPerYear,
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1
              }
          ]
      };

      const barChartConfig = {
          type: 'bar',
          data: barChartData,
          options: {
              responsive: true,
              plugins: {
                  legend: {
                      position: 'top',
                  },
                  title: {
                      display: true,
                      text: `${label} Per Year (${season} Season)`
                  },
                  tooltip: {
                      callbacks: {
                          label: function(tooltipItem) {
                              const index = tooltipItem.dataIndex;
                              const year = uniqueYears[index];
                              const yearlyData = dataset.filter(entry => entry.monthYear.endsWith(year));
                              return [
                                  `${keys[0]} per Year: ${totalsPerYear[index]}`,
                                  ...keys.slice(1).map(key => {
                                      const total = yearlyData.reduce((acc, entry) => acc + (entry[key] || 0), 0);
                                      return `${key} per Year: ${total}`;
                                  })
                              ];
                          }
                      }
                  }
              },
              scales: {
                  x: {
                      title: {
                          display: true,
                          text: 'Year'
                      }
                  },
                  y: {
                      title: {
                          display: true,
                          text: label
                      }
                  }
              }
          }
      };

      return { barChartConfig };
  }

  // Function to display trends on the chart
  function displayTrends(chartConfigs) {
      const bar = Chart.getChart('totalPerYearChart');
      if (bar) {
          bar.destroy();
      }

      if (chartConfigs.barChartConfig) {
          new Chart(document.getElementById('totalPerYearChart'), chartConfigs.barChartConfig);
      }
  }

  async function initializeCrops() {
      try {
          return await getCrop();
      } catch (error) {
          console.error('Failed to initialize crops:', error);
      }
  }

  class TopCrops {
      constructor(season, type) {
          this.season = season;
          this.type = type; 
          this.initialize();
      }

      async initialize() {
          try {
              let cropData = await this.fetchCropData();
              const topCrops = this.generateTopCrops(cropData);
              this.displayTopCrops(topCrops);            
          } catch (error) {
              console.error('Failed to initialize TopCrops:', error);
          }
      }
      
      async fetchCropData() {
          try {
              return await main(this.season, this.type);
          } catch (error) {
              console.error('Failed to fetch crop data:', error);
          }
      }

      generateTopCrops(data) {
          const aggregatedData = this.aggregateData(data);
          const averagedData = this.averageData(aggregatedData);
          const ranges = this.calculateRanges(averagedData);
          const scoredData = this.calculateScores(averagedData, ranges);

          return this.rankData(scoredData);
      }

      aggregateData(data) {
          return data.reduce((acc, entry) => {
              const key = `${entry.cropName} - ${entry.variety}`;
              if (!acc[key]) {
                  acc[key] = {
                      volumeProductionPerHectare: 0,
                      incomePerHectare: 0,
                      benefitPerHectare: 0,
                      price: 0,
                      pestOccurrence: 0,
                      diseaseOccurrence: 0,
                      totalPlanted: 0,
                      count: 0
                  };
              }
              const item = acc[key];
              item.volumeProductionPerHectare += entry.volumeProductionPerHectare;
              item.incomePerHectare += entry.incomePerHectare;
              item.benefitPerHectare += entry.benefitPerHectare;
              item.price += entry.price;
              item.pestOccurrence += entry.pestOccurrence;
              item.diseaseOccurrence += entry.diseaseOccurrence;
              item.totalPlanted += entry.totalPlanted;
              item.count += 1;
              return acc;
          }, {});
      }

      averageData(aggregatedData) {
          return Object.entries(aggregatedData).map(([key, values]) => ({
              cropName: key.split(' - ')[0],
              variety: key.split(' - ')[1],
              type: $('#typeSelect').val(),
              volumeProductionPerHectare: values.volumeProductionPerHectare / values.count,
              incomePerHectare: values.incomePerHectare / values.count,
              benefitPerHectare: values.benefitPerHectare / values.count,
              price: values.price / values.count,
              pestOccurrence: values.pestOccurrence / values.count,
              diseaseOccurrence: values.diseaseOccurrence / values.count,
              totalPlanted: values.totalPlanted / values.count
          }));
      }

      calculateRanges(averagedData) {
          const calculateMinMax = (data, key) => {
              const values = data.map(entry => entry[key]);
              return { min: Math.min(...values), max: Math.max(...values) };
          };

          return {
              volumeProduction: calculateMinMax(averagedData, 'volumeProductionPerHectare'),
              income: calculateMinMax(averagedData, 'incomePerHectare'),
              benefit: calculateMinMax(averagedData, 'benefitPerHectare'),
              price: calculateMinMax(averagedData, 'price'),
              pest: calculateMinMax(averagedData, 'pestOccurrence'),
              disease: calculateMinMax(averagedData, 'diseaseOccurrence')
          };
      }

      calculateScores(averagedData, ranges) {
          const normalize = (value, min, max) => (value - min) / (max - min);
          const calculateCompositeScore = (entry) => {
              const indicators = {
                  volumeProduction: entry.volumeProductionPerHectare,
                  income: entry.incomePerHectare,
                  benefit: entry.benefitPerHectare,
                  price: entry.price,
                  pest: -entry.pestOccurrence,
                  disease: -entry.diseaseOccurrence
              };

              const normalizedIndicators = {
                  volumeProduction: normalize(indicators.volumeProduction, ranges.volumeProduction.min, ranges.volumeProduction.max),
                  income: normalize(indicators.income, ranges.income.min, ranges.income.max),
                  benefit: normalize(indicators.benefit, ranges.benefit.min, ranges.benefit.max),
                  price: normalize(indicators.price, ranges.price.min, ranges.price.max),
                  pest: normalize(indicators.pest, -ranges.pest.max, -ranges.pest.min),
                  disease: normalize(indicators.disease, -ranges.disease.max, -ranges.disease.min)
              };

              return (
                  0.2 * normalizedIndicators.volumeProduction +
                  0.2 * normalizedIndicators.income +
                  0.2 * normalizedIndicators.benefit +
                  0.2 * normalizedIndicators.price +
                  0.1 * normalizedIndicators.pest +
                  0.1 * normalizedIndicators.disease
              );
          };

          return averagedData.map(entry => ({
              ...entry,
              compositeScore: calculateCompositeScore(entry)
          }));
      }

      rankData(scoredData) {
          const rankedData = scoredData.sort((a, b) => b.compositeScore - a.compositeScore);

          // Get the top 5 entries
          const top5 = rankedData.slice(0, 5);

          // Map through the top 5 entries to add rank and performance
          return top5.map((entry, index) => ({
              ...entry,
              rank: index + 1,
              performance: index === 0 ? "highest" : index === top5.length - 1 ? "lowest" : "average"
          }));
      }

      displayTopCrops(data) {
          const tableBody = $('#cropsTable tbody');
          tableBody.empty(); // Clear existing rows

          data.forEach(crop => {
              const row = `<tr>
                  <td>${crop.cropName}</td>
                  <td>${crop.variety}</td>                
              </tr>`;
              tableBody.append(row);
          });
      }
  }

  $(document).ready(function() {
      new TopCrops("Dry", "Vegetables");

      $('#seasonSelect, #typeSelect').on('change', function() {
          const season = $('#seasonSelect').val();
          const type = $('#typeSelect').val();
          new TopCrops(season, type);
      });
  });

  async function main(season, type) {
      try {
          let crops = await initializeCrops();
          let production = await getProduction("", season);
          let price = await getPrice("", season);
          let pest = await getPest("", season);
          let disease = await getDisease("", season);

          production = production.map(entry => ({ ...entry, type }));
          price = price.map(entry => ({ ...entry, type }));
          pest = pest.map(entry => ({ ...entry, type }));
          disease = disease.map(entry => ({ ...entry, type }));

          return await getCropData(production, price, pest, disease, crops, type);
      } catch (error) {
          console.error('An error occurred in the main function:', error);
      }
  }

}