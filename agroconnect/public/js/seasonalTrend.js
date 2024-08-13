import { getCrop, getProduction, getPrice, getPest, getDisease, getProductions} from './fetch.js';
import * as stats from './statistics.js';

let colorIndex = 0;

function getColor(opacity = 1) {
    // Define an array of colors
    const colors = [
        'rgba(54, 162, 235',  // Blue
        'rgba(255, 99, 132',  // Red
        'rgba(75, 192, 192',  // Green
        'rgba(153, 102, 255', // Purple
        'rgba(255, 159, 64'   // Orange
    ];

    // Cycle through colors
    const color = colors[colorIndex];
   
    colorIndex++;

    // Return color with specified opacity
    return `${color}, ${opacity})`;
}


class SeasonalTrends {
    constructor(season, type, crops, category) {
        this.season = season;
        this.type = type;
        this.crops = crops; // This is now an array of crop names
        this.category = category;        
    }

    generateTrends(dataset, label, keys) {
    if (!dataset.length) {
        return { lineChartConfig: null, barChartConfig: null }; // Return null configurations if the dataset is empty
    }

    // Extract unique seasons and years
    const uniqueSeasons = Array.from(new Set(dataset.map(entry => entry.season)));
    const season = uniqueSeasons[0] || 'Unknown'; // Use the first season from the dataset
    const uniqueYears = Array.from(new Set(dataset.map(entry => entry.monthYear.split(' ')[1]))).sort((a, b) => a - b);

    // Calculate year range
    const yearRange = uniqueYears.length === 1
        ? uniqueYears[0]
        : `${Math.min(...uniqueYears)}-${Math.max(...uniqueYears)}`;

    // Prepare data for line chart
     // Prepare and sort monthly labels
    const monthlyLabels = Array.from(new Set(dataset.map(entry => entry.monthYear)))
        .sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            return yearA - yearB || monthA.localeCompare(monthB);
        });
    const crops = Array.from(new Set(dataset.map(entry => entry.cropName)));

    const dataValues = crops.map(crop => {
        return {
            label: crop,
            data: monthlyLabels.map(monthYear => {
                const entry = dataset.find(e => e.cropName === crop && e.monthYear === monthYear);
                return entry ? entry[keys[0]] : 0;
            })
        };
    });

    const lineChartData = {
    labels: monthlyLabels,
    datasets: dataValues
        .filter(dataset => dataset.data.some(value => value !== 0)) // Filter out datasets with only zero values
        .map(dataset => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: getColor(), // Replace getColor() with a function or color array for consistent colors
            backgroundColor: getColor(0.2),
            fill: false,
            cubicInterpolationMode: 'monotone'
        }))
};


    const lineChartConfig = {
        type: 'line',
        data: lineChartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `${label} Trends (${season} Season) (${yearRange})`
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const index = tooltipItem.dataIndex;
                            const monthYear = monthlyLabels[index];
                            const monthlyData = dataset.filter(entry => entry.monthYear === monthYear);
                            return [
                                `${keys[0]}: ${dataValues[tooltipItem.datasetIndex].data[index]}`,
                                ...keys.slice(1).map(key => {
                                    const total = monthlyData.reduce((acc, entry) => acc + (entry[key] || 0), 0);
                                    return `${key}: ${total}`;
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
                        text: 'Month'
                    },
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: false,
                        callback: function(value, index) {
                            const dateParts = lineChartData.labels[index].split(' ');
                            const year = dateParts[1];
                            if (index === lineChartData.labels.findIndex(label => label.endsWith(year))) {
                                return year;
                            }
                            return '';
                        }
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
    colorIndex = 0;
    // Calculate totals per year for bar chart
    const totalsPerYear = uniqueYears.map(year => {
        return crops.map(crop =>
            dataset
                .filter(entry => entry.monthYear.endsWith(year) && entry.cropName === crop)
                .reduce((sum, entry) => sum + entry[keys[0]], 0)
        );
    });

    const barChartData = {
        labels: uniqueYears,
        datasets: crops.map((crop, index) => ({
            label: crop,
            data: totalsPerYear.map(yearTotals => yearTotals[index] || 0),
            backgroundColor: getColor(0.2),
            borderColor: getColor(),
            borderWidth: 1
        }))
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
                            const total = totalsPerYear[index].reduce((a, b) => a + b, 0);
                            return [
                                `${keys[0]} per Year: ${total}`,
                                ...keys.slice(1).map(key => {
                                    const yearlyData = dataset.filter(entry => entry.monthYear.endsWith(year));
                                    const totalPerKey = yearlyData.reduce((acc, entry) => acc + (entry[key] || 0), 0);
                                    return `${key} per Year: ${totalPerKey}`;
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
    colorIndex = 0;
    return {
        lineChartConfig,
        barChartConfig
    };
}

    displayTrends(chartConfigs, interpretation) {
        // Check if a chart instance already exists and destroy it
        const line = Chart.getChart('seasonalTrendChart'); // Retrieve the existing chart instance
        const bar = Chart.getChart('totalPerYearChart');
        if (line) {
            line.destroy(); // Destroy the existing chart instance
            bar.destroy();
            $('#interpretation').empty();
        }

        // Create the line chart
        new Chart(
            document.getElementById('seasonalTrendChart'),
            chartConfigs.lineChartConfig
        );

        // Create the bar chart
        new Chart(
            document.getElementById('totalPerYearChart'),
            chartConfigs.barChartConfig
        );
        
        $('#interpretation').text(interpretation);
    }
}

let downloadData;
let currentType;

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

// Function to update crop options based on type
async function updateCropOptions() {
    const type = $('#type').val().toLowerCase();
    
    try {
        // Fetch crops based on the selected type
        const crops = await getCrop(type);
        const uniqueCropNames = await getUniqueCropNames();
        let options;

        // Prepare the options for the multiselect
        if (crops.length > 0) {
            const filteredCrops = crops.filter(crop => uniqueCropNames.includes(crop.cropName.toLowerCase()));
            console.log('Filtered crops:', filteredCrops); // Debug: Log filtered crops
            options = filteredCrops.length > 0 
                ? filteredCrops.map(crop => `<option value="${crop.cropName.toLowerCase()}">${crop.cropName}</option>`).join('')
                : '<option value="">No crops available</option>';
        } else {
            options = '<option value="">No crops available</option>';
        }

        // Update the <select> element
        $('#crop').html(options);

        // Rebuild the Bootstrap Multiselect to reflect changes
        $('#crop').multiselect('rebuild');
    } catch (error) {
        console.error('Failed to update crop options:', error);
        $('#crop').html('<option value="">Error loading crops</option>');
        $('#crop').multiselect('rebuild');
    }
}

// Function to handle category change and display results
async function handleCategoryChange() {
    const season = $('#season').val();
    const type = $('#type').val();
    const crops = $('#crop').val(); // This will be an array of selected crops
    const category = $('#category').val();

    // Convert crops to array if it's not already
    const cropArray = Array.isArray(crops) ? crops : crops.split(',');    

    // Check if any crop is selected
    if (!cropArray || cropArray.length === 0) {
        $('#available').hide();
        $('#unavailable').hide();
        $('#selectFirst').show();
        return; // Exit the function if no crop is selected
    }

    let categoryText;
    let dataset = [];
    let key = [];

    for (const crop of cropArray) {
        let data = [];
        switch (category) {
            case 'total_planted':
                categoryText = 'Total Planted';
                key = ["totalPlanted"];
                data = await getProduction(crop, season);
                dataset = dataset.concat(stats.countTotalPlanted(data));
                break;
            case 'production_volume':
                categoryText = 'Production Volume Per Hectare';
                key = ["volumeProduction", "totalVolume", "totalArea"];
                data = await getProduction(crop, season);
                dataset = dataset.concat(stats.averageVolumeProduction(data));
                break;
            case 'price':
                categoryText = 'Price';
                key = ["price"];
                data = await getPrice(crop, season);
                dataset = dataset.concat(stats.averagePrice(data));
                break;
            case 'pest_occurrence':
                categoryText = 'Pest Occurrence';
                key = ["pestOccurrence"];
                data = await getPest(crop, season);
                dataset = dataset.concat(stats.countPestOccurrence(data));
                break;
            case 'disease_occurrence':
                categoryText = 'Disease Occurrence';
                key = ["diseaseOccurrence"];
                data = await getDisease(crop, season);
                dataset = dataset.concat(stats.countDiseaseOccurrence(data));
                break;
            case 'price_income_per_hectare':
                categoryText = 'Price Income per Hectare';
                key = ["incomePerHectare", "totalArea", "totalIncome"];
                data = await getProduction(crop, season);
                dataset = dataset.concat(stats.priceIncomePerHectare(data));
                break;
            case 'benefit_per_hectare':
                categoryText = 'Benefit per Hectare';
                key = ["benefitPerHectare", "totalArea", "totalIncome", "totalProductionCost"];
                data = await getProduction(crop, season);
                dataset = dataset.concat(stats.benefitPerHectare(data));
                break;
            default:
                categoryText = 'Category not recognized';
        }
    }    

    if (dataset.length !== 0) {
        $('#unavailable').hide();
        $('#selectFirst').hide();
        $('#available').show();
        const st = new SeasonalTrends(season, type, cropArray, categoryText);
        const interpretation = interpretData(dataset, key[0]);
        
        const charts = st.generateTrends(dataset, categoryText, key);
        st.displayTrends(charts, interpretation);        
        currentType = key[0];
        downloadData = dataset;
    } else {
        $('#available').hide();
        $('#selectFirst').hide();
        $('#unavailable').show();
    }   
                
}

// Document ready function
$(document).ready(async function() {
      
    updateCropOptions().then(() => handleCategoryChange());
    $('#crop').multiselect({
    includeSelectAllOption: false,
    enableFiltering: true,
    enableCaseInsensitiveFiltering: true,
    buttonWidth: '100%',
    onChange: function(option, checked, select) {
            // Limit to 3 selections
            var selectedOptions = $('#crop').val();
            if (selectedOptions.length > 5) {
                alert('You can only select up to 5 options.');
                $(option).prop('selected', false); // Deselect the option
                $('#crop').multiselect('refresh'); // Refresh the multiselect to update UI
            }
        }
    });

    // Attach event listeners for changes
    $('#type').on('change', function() {
        updateCropOptions().then(() => handleCategoryChange());
        $('#crop').prop('selectedIndex', -1);       
    });
    
    $('#category, #crop, #season').on('change', function() {
        handleCategoryChange();
    });
});

function interpretData(data, key) {
    const results = {};
    const groupedData = {};

    // Group data by cropName
    data.forEach((item) => {
        const { cropName, monthYear } = item;
        const value = item[key];
        const year = new Date(monthYear).getFullYear();

        if (!groupedData[cropName]) {
            groupedData[cropName] = { total: 0, yearlyData: {}, years: [] };
        }

        const cropData = groupedData[cropName];
        cropData.total += value;

        if (!cropData.yearlyData[year]) {
            cropData.yearlyData[year] = [];
        }
        cropData.yearlyData[year].push(value);
        if (!cropData.years.includes(year)) {
            cropData.years.push(year);
        }
    });

    // Process each crop
    for (const cropName in groupedData) {
        const cropData = groupedData[cropName];
        const { total, yearlyData, years } = cropData;
        years.sort((a, b) => a - b);
        const yearlyAverages = stats.calculateYearlyAverages(yearlyData);

        // Calculate growth rates
        const growthRates = [];
        if (years.length >= 2) {
            for (let i = 1; i < years.length; i++) {
                const previousYearAvg = yearlyAverages[i - 1];
                const currentYearAvg = yearlyAverages[i];
                const growthRate = Math.round(((currentYearAvg - previousYearAvg) / previousYearAvg) * 100);
                growthRates.push(growthRate);
            }
            const growthRateOverall = Math.round(((yearlyAverages[yearlyAverages.length - 1] - yearlyAverages[0]) / yearlyAverages[0]) * 100);
            results[cropName] = {
                average: total / data.length,
                growthRateOverall,
                growthRateLatestYear: growthRates[growthRates.length - 1] || 0,
                zScores: [],
                performance: '',
            };

            // Calculate Z-scores for growth rates and interpret performance
            if (growthRates.length > 0) {
                const { growthRateZScores, meanGrowthRateZScore } = stats.calculateZScoresForGrowthRates(yearlyAverages, growthRates);
                results[cropName].zScores = growthRateZScores;
                results[cropName].performance = stats.interpretPerformance(meanGrowthRateZScore);
            }
        } else {
            results[cropName] = {
                average: total / data.length,
                growthRateOverall: 0,
                growthRateLatestYear: 0,
                zScores: [],
                performance: 'Insufficient data',
            };
        }
    }

    // Find highest and lowest performing crops
    const performanceScores = [];
    let highestCrops = [];
    let lowestCrops = [];
    let highestPerformance = -Infinity;
    let lowestPerformance = Infinity;
    let allSamePerformance = true;

    for (const cropName in results) {
        const { average, growthRateOverall } = results[cropName];
        const performanceScore = stats.interpretPerformanceScore(growthRateOverall); // Implement this function to quantify performance
        performanceScores.push({ cropName, performanceScore });

        if (performanceScore > highestPerformance) {
            highestPerformance = performanceScore;
            highestCrops = [cropName];
        } else if (performanceScore === highestPerformance) {
            highestCrops.push(cropName);
        }

        if (performanceScore < lowestPerformance) {
            lowestPerformance = performanceScore;
            lowestCrops = [cropName];
        } else if (performanceScore === lowestPerformance) {
            lowestCrops.push(cropName);
        }

        // Check if performance scores are not the same
        if (performanceScore !== highestPerformance) {
            allSamePerformance = false;
        }
    }

    // Construct interpretation
    let interpretation = '';
    if (performanceScores.length === 1) {
        const singleCrop = performanceScores[0].cropName;
        const singleCropData = results[singleCrop];
        interpretation += `The only crop in the dataset is ${singleCrop} with an average ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} of ${singleCropData.average.toFixed(2)} units per hectare.`;
        if (groupedData[singleCrop].years.length > 1) {
            interpretation += ` The overall growth rate was ${singleCropData.growthRateOverall}%.`;
        }
        if (groupedData[singleCrop].years.length > 2) {
            interpretation += ` The latest year saw a Year-on-Year growth rate of ${singleCropData.growthRateLatestYear}%.`;
            interpretation += ` Based on these, the performance can be described as ${singleCropData.performance}.`;
        }
    } else if (allSamePerformance) {
        interpretation += `All crops have the same performance score, so no distinct highest or lowest performers can be identified. However, the growth rates are as follows:\n`;
        performanceScores.forEach(({ cropName, performanceScore }) => {
            const cropData = results[cropName];
            interpretation += `\n- ${cropName}: Average ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} of ${cropData.average.toFixed(2)} units per hectare, overall growth rate of ${cropData.growthRateOverall}%.`; 
                           
             
            if (cropData.zScores.length > 0 && !cropData.zScores.includes(NaN)) {
    interpretation += ` Latest year growth rate of ${cropData.growthRateLatestYear}%, and performance described as ${cropData.performance}.`;
    
}

          
        });
    } else {
        if (highestCrops.length > 0) {
            interpretation += `From ${groupedData[highestCrops[0]].years[0]} to ${groupedData[highestCrops[0]].years[groupedData[highestCrops[0]].years.length - 1]}, the highest performing crop${highestCrops.length > 1 ? 's' : ''} was/were ${highestCrops.join(', ')} with an average ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} of ${results[highestCrops[0]].average.toFixed(2)} units per hectare.`;

            if (groupedData[highestCrops[0]].years.length > 1) {
                interpretation += ` The overall growth rate was ${results[highestCrops[0]].growthRateOverall}%.`;
            }
            if (groupedData[highestCrops[0]].years.length > 2) {
                interpretation += ` The latest year saw a Year-on-Year growth rate of ${results[highestCrops[0]].growthRateLatestYear}%.`;
                interpretation += ` Based on these, the performance can be described as ${results[highestCrops[0]].performance}.`;
            }
        }

        if (lowestCrops.length > 0) {
            interpretation += `\n\nThe lowest performing crop${lowestCrops.length > 1 ? 's' : ''} was/were ${lowestCrops.join(', ')} with an average ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} of ${results[lowestCrops[0]].average.toFixed(2)} units per hectare.`;

            if (groupedData[lowestCrops[0]].years.length > 1) {
                interpretation += ` The overall growth rate was ${results[lowestCrops[0]].growthRateOverall}%.`;
            }
            if (groupedData[lowestCrops[0]].years.length > 2) {
                interpretation += ` The latest year saw a Year-on-Year growth rate of ${results[lowestCrops[0]].growthRateLatestYear}%.`;
                interpretation += ` Based on these, the performance can be described as ${results[lowestCrops[0]].performance}.`;
            }
        }
    }

    return interpretation;
}

$(document).ready(function() {
    $('.download-btn').click(function() {
        $('#downloadModal').modal('show');
    });

    $('.download-option').click(function() {
        const format = $(this).data('format');
        download(format, currentType, downloadData);
    });
});


function download(format, type, data) {
    const filename = `${type.toLowerCase()}.${format}`;
    if (format === 'csv') {
      downloadCSV(filename, data);
    } else if (format === 'xlsx') {
      downloadExcel(filename, data);
    } else if (format === 'pdf') {
      downloadPDF(filename);
    }
  }

function formatHeader(key) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
}

function escapeCSVValue(value) {
  if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
    value = '"' + value.replace(/"/g, '""') + '"';
  }
  return `"${value}"`; // Enclose each value in double quotes
}

function downloadCSV(filename, data) {
  const keys = Object.keys(data[0]);
  const headers = keys.map(formatHeader);

  const csv = [
    headers,
    ...data.map(record => 
      keys.map(key => 
        key === 'monthYear' ? `'${record[key]}` : escapeCSVValue(record[key])
      )
    )
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadExcel(filename, data) {
  // Get keys from the first record and format them
  const keys = Object.keys(data[0]);
  const headers = keys.map(formatHeader);

  // Prepare the worksheet data
  const worksheetData = [
    headers,
    ...data.map(record => 
      keys.map(key => key === 'monthYear' ? `'${record[key]}` : record[key])
    )
  ];

  // Create a new workbook and add the worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Write the workbook and trigger the download
  XLSX.writeFile(workbook, filename);
}

function downloadPDF(filename) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add content from seasonalTrendChart
    html2canvas(document.getElementById('seasonalTrendChart')).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, 10, 190, 80); // Add seasonalTrendChart to PDF

        // Add some space before the next section
        let currentY = 100; // Initial y-coordinate after the first image

        // Add content from interpretation
        const interpretation = document.getElementById('interpretation').innerText;
        const interpretationLines = doc.splitTextToSize(interpretation, 190);
        doc.text(interpretationLines, 10, currentY); // Add interpretation text to PDF

        // Adjust y-coordinate for the next section based on the interpretation text height
        currentY += interpretationLines.length * 8;
        // Add content from totalPerYearChart
        html2canvas(document.getElementById('totalPerYearChart')).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 10, currentY, 190, 80); // Add totalPerYearChart to PDF

            doc.save(filename); // Save the PDF
        });
    });
}