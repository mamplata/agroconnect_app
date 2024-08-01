class SeasonalTrends {
    constructor(season, type, crop, category) {
        this.season = season;
        this.type = type;
        this.crop = crop;
        this.category = category;
    }

    generateTrends(dataset, label, keys) {
    if (!dataset.length) { 
        return { lineChartConfig: null, barChartConfig: null }; // Return null configurations if the dataset is empty 
    }

    // Extract unique seasons
    const uniqueSeasons = Array.from(new Set(dataset.map(entry => entry.season)));
    const season = uniqueSeasons[0] || 'Unknown'; // Use the first season from the dataset

    // Extract and sort unique years
    const uniqueYears = Array.from(new Set(dataset.map(entry => entry.monthYear.split(' ')[1])));
    uniqueYears.sort((a, b) => a - b); // Sort years in ascending order

    // Prepare data for line chart, sorted by year
    const sortedDataset = uniqueYears.flatMap(year => 
        dataset.filter(entry => entry.monthYear.endsWith(year))
    );

    const labels = sortedDataset.map(entry => entry.monthYear);
    const dataValues = sortedDataset.map(entry => entry[keys[0]]);

    const yearRange = uniqueYears.length === 1
        ? uniqueYears[0]
        : `${Math.min(...uniqueYears)}-${Math.max(...uniqueYears)}`;

    // Generate line chart configuration
    const lineChartData = {
        labels: labels,
        datasets: [
            {
                label: label,
                data: dataValues,
                borderColor: 'rgba(54, 162, 235, 1)', // Blue color
                backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue color with transparency
                fill: false,
                cubicInterpolationMode: 'monotone'
            }
        ]
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
                            const item = sortedDataset[index];
                            return [
                                `${keys[0]}: ${item[keys[0]]}`,
                                ...keys.slice(1).map(key => `${key}: ${item[key] || 'N/A'}`)
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
                    },
                    ticks: {
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: false,
                        callback: function(value, index, values) {
                            const dateParts = lineChartData.labels[value].split(' ');
                            const year = dateParts[1];
                            if (index === labels.findIndex(label => label.endsWith(year))) {
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

    // Calculate totals per year for bar chart
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
                backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue color with transparency
                borderColor: 'rgba(54, 162, 235, 1)', // Blue color
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
                            // Filter dataset for the specific year to get details
                            const yearlyData = dataset.filter(entry => entry.monthYear.endsWith(year));
                            // Summarize information
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

// Function to update crop options based on type
async function updateCropOptions() {
    const type = $('#type').val().toLowerCase();
    let options = '';

    try {
        const crops = await getCrop(type);

        if (crops.length > 0) {
            options = crops.map(crop => `<option value="${crop.cropName}">${crop.cropName}</option>`).join('');
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
    switch (category) {
        case 'total_planted':
            categoryText = 'Total Planted';
            key = ["totalPlanted"];
            data = await getProduction(crop, season); // Fetch the production data
            dataset = countTotalPlanted(data);           
            break;
        case 'production_volume':
            categoryText = 'Production Volume Per Hectare';
            key = ["volumeProduction", "totalVolume", "totalArea"];
            data = await getProduction(crop, season);
            dataset = averageVolumeProduction(data);
            console.log(dataset);
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

    const st = new SeasonalTrends(season, type, crop, categoryText);
    console.log(crop);
    if (dataset.length !== 0 && crop !== null) {
        $('#unavailable').hide();
        $('#available').show();
        const interpretation = interpretData(dataset, key[0]);
        const charts = st.generateTrends(dataset, categoryText, key);
        st.displayTrends(charts, interpretation);
        currentType = key[0];
        downloadData = dataset;
    } else {
        $('#available').hide();
        $('#unavailable').show();
    }
}

// Initialize with default crop options and log initial category
$(document).ready(async function() {
    await updateCropOptions();
    await handleCategoryChange();
    // Attach event listeners for changes
    $('#type').on('change', updateCropOptions);
    $('#type, #category, #crop, #season').on('change', handleCategoryChange);
});

function interpretData(data, key) {
    const results = {
        total: 0,
        average: 0,
        growthRateOverall: 0,
        growthRateLatestYear: 0,
        seasonalIndexLatestYear: 0,
        monthPeak: null,
        monthMid: null,
        monthLowest: null,
        zScores: [],
        performance: '',
    };

    const yearlyData = {};
    const monthlyData = {};

    // Process data
    data.forEach((item) => {
        const { monthYear } = item;
        const value = item[key];
        const year = new Date(monthYear).getFullYear();
        const month = new Date(monthYear).toLocaleString('default', { month: 'long' });

        results.total += value;

        if (!yearlyData[year]) {
            yearlyData[year] = [];
        }
        yearlyData[year].push(value);

        if (!monthlyData[month]) {
            monthlyData[month] = [];
        }
        monthlyData[month].push(value);
    });

    // Calculate yearly averages
    const years = Object.keys(yearlyData).map(year => parseInt(year));
    years.sort((a, b) => a - b);
    const yearlyAverages = calculateYearlyAverages(yearlyData);

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
        results.growthRateOverall = growthRateOverall;
        results.growthRateLatestYear = growthRates[growthRates.length - 1];
    }

    // Calculate overall average
    results.average = results.total / data.length;

    // Calculate seasonal index for the latest year
    results.seasonalIndexLatestYear = calculateSeasonalIndex(yearlyAverages);

    // Calculate monthly averages and find peak, mid, and lowest months
    const monthlyAverages = calculateMonthlyAverages(monthlyData);
    const { monthPeak, monthMid, monthLowest } = findPeakMidLowestMonths(monthlyAverages);

    results.monthPeak = monthPeak;
    results.monthMid = monthMid;
    results.monthLowest = monthLowest;

    // Calculate Z-scores for growth rates and interpret performance
    if (growthRates.length > 0) {
        const { growthRateZScores, meanGrowthRateZScore } = calculateZScoresForGrowthRates(yearlyAverages, growthRates);
        results.zScores = growthRateZScores;
        results.meanGrowthRateZScore = meanGrowthRateZScore;
        results.performance = interpretPerformance(meanGrowthRateZScore);
    }

    const statistics = calculateStatistics(data);
    const variationLow = isVariationLow(statistics.stdDev);
    let variation;

    if (variationLow) {
        variation = `Overall, the data reflects ${results.performance} performance with minimal variation.`;
    } else {
        variation = `Overall, the data reflects ${results.performance} performance with noticeable changes between months and years.`;
    }

    // Construct interpretation
    let interpretation = `From ${years[0]}${years.length > 1 ? ` to ${years[years.length - 1]}` : ''}, the average ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} for ${data[0].cropName} was ${results.average.toFixed(2)} units per hectare.`;

    if (years.length > 1) {
        interpretation += ` The overall growth rate was ${results.growthRateOverall}%.`;
    }
    if (years.length > 2) {
        interpretation += ` The latest year saw a growth rate of ${results.growthRateLatestYear}%.`;
    }
    
    if (years.length > 1) {
        interpretation += ` The seasonal index for the latest year indicates a ${results.seasonalIndexLatestYear}% variation compared to the average.`;
    }

    interpretation += ` The peak month was ${results.monthPeak}, while ${results.monthLowest} showed the lowest. The middle-performing month was ${results.monthMid}. ${variation}`;

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
