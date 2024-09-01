import { getCrop, getProduction, getPrice, getPest, getDisease, getProductions, addDownload, getUniqueCropNames} from './fetch.js';
import * as stats from './statistics.js';
import Dialog from '../management/components/helpers/Dialog.js';

let colorIndex = 0;
let downloadYR;

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
        this.crops = crops; 
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

    downloadYR = yearRange;

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
                        text: 'Year'
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
                                `${keys[0]} per Year: ${total.toFixed(2)}`,
                                ...keys.slice(1).map(key => {
                                    const yearlyData = dataset.filter(entry => entry.monthYear.endsWith(year));
                                    const totalPerKey = yearlyData.reduce((acc, entry) => acc + (entry[key] || 0), 0);
                                    return `${key} per Year: ${totalPerKey.toFixed(2)}`;
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
        
        $('#interpretation').html(interpretation);
    }
}

let downloadData;
let currentType;


// Function to update crop options based on type and season
async function updateCropOptions() {
    const type = $('#type').val().toLowerCase();
    const season = $('#season').val().toLowerCase();
    let options = '';

    try {
        const uniqueCropNames = await getUniqueCropNames(season, type);

        if (uniqueCropNames.length > 0) {
            options = uniqueCropNames.length > 0 
                ? uniqueCropNames.map(cropName => `<option value="${cropName}">${cropName.charAt(0).toUpperCase() + cropName.slice(1)}</option>`).join('')
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
    const crop = $('#crop').val(); // This will be a single selected crop
    const category = $('#category').val();

    // Check if any crop is selected
    if (!crop) {
        $('#available').hide();
        $('#unavailable').hide();
        $('#selectFirst').show();
        return; // Exit the function if no crop is selected
    }

    let categoryText;
    let dataset = [];
    let key = [];

    let data = [];
    switch (category) {
        case 'total_planted':
            categoryText = 'Total Planted';
            key = ["totalPlanted"];
            data = await getProduction(crop, season);
            dataset = stats.countTotalPlanted(data);
            break;
        case 'production_volume':
            categoryText = 'Production Volume Per Hectare';
            key = ["volumeProduction", "totalVolume", "totalArea"];
            data = await getProduction(crop, season);
            dataset = stats.averageVolumeProduction(data);
            console.log(dataset);
            break;
        case 'price':
            categoryText = 'Price';
            key = ["price"];
            data = await getPrice(crop, season);
            dataset = stats.averagePrice(data);
            break;
        case 'pest_occurrence':
            categoryText = 'Pest Occurrence';
            key = ["pestOccurrence"];
            data = await getPest(crop, season);
            dataset = stats.countPestOccurrence(data);
            break;
        case 'disease_occurrence':
            categoryText = 'Disease Occurrence';
            key = ["diseaseOccurrence"];
            data = await getDisease(crop, season);
            dataset = stats.countDiseaseOccurrence(data);
            break;
        case 'price_income_per_hectare':
            categoryText = 'Price Income per Hectare';
            key = ["incomePerHectare", "totalArea", "totalIncome"];
            data = await getProduction(crop, season);
            dataset = stats.priceIncomePerHectare(data);
            console.log(dataset);
            break;
        case 'benefit_per_hectare':
            categoryText = 'Benefit per Hectare';
            key = ["benefitPerHectare", "totalArea", "totalIncome", "totalProductionCost"];
            data = await getProduction(crop, season);
            dataset = stats.benefitPerHectare(data);
            break;
        default:
            categoryText = 'Category not recognized';
    }

    if (dataset.length !== 0) {
        $('#unavailable').hide();
        $('#selectFirst').hide();
        $('#available').show();
        const st = new SeasonalTrends(season, type, crop, categoryText);
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
    updateCropOptions().then(() =>  handleCategoryChange());

    // Attach event listeners for changes
    $('#type').on('change', function() {
        updateCropOptions().then(() => handleCategoryChange());
    });
    $('#category, #crop, #season').on('change', function() {
        handleCategoryChange();
    });
});

function interpretData(data, key) {
    const cropData = { total: 0, yearlyData: {}, years: [] };
    const cropName = data[0]?.cropName || 'Unknown Crop';

    // Group data by year and calculate total
    data.forEach((item) => {
        const { monthYear } = item;
        const value = item[key];
        const year = new Date(monthYear).getFullYear();

        cropData.total += value;

        if (!cropData.yearlyData[year]) {
            cropData.yearlyData[year] = [];
        }
        cropData.yearlyData[year].push(value);
        if (!cropData.years.includes(year)) {
            cropData.years.push(year);
        }
    });

    cropData.years.sort((a, b) => a - b);
    const yearlyAverages = stats.calculateYearlyAverages(cropData.yearlyData);

    // Calculate growth rates
    const growthRates = [];
    if (cropData.years.length >= 2) {
        for (let i = 1; i < cropData.years.length; i++) {
            const previousYearAvg = yearlyAverages[i - 1];
            const currentYearAvg = yearlyAverages[i];
            const growthRate = Math.round(((currentYearAvg - previousYearAvg) / previousYearAvg) * 100);
            growthRates.push(growthRate);
        }
    }
    const growthRateOverall = cropData.years.length >= 2
        ? Math.round(((yearlyAverages[yearlyAverages.length - 1] - yearlyAverages[0]) / yearlyAverages[0]) * 100)
        : 0;

    const result = {
        average: cropData.total / data.length,
        growthRateOverall,
        growthRateLatestYear: growthRates[growthRates.length - 1] || 0,
        zScores: [],
        performance: '',
    };

    // Calculate Z-scores for growth rates and interpret performance
    if (growthRates.length > 0) {
        const { growthRateZScores, meanGrowthRateZScore } = stats.calculateZScoresForGrowthRates(yearlyAverages, growthRates);
        result.zScores = growthRateZScores;
        result.performance = stats.interpretPerformance(meanGrowthRateZScore);
    } else {
        result.performance = 'Insufficient data';
    }

    // Calculate average value by month based on the specified key
    const averageByMonth = (data, key) => {
        const aggregates = data.reduce((acc, entry) => {
            const [month] = entry.monthYear.split(' ');
            const keyName = `${entry.cropName} - ${month}`;
            if (!acc[keyName]) {
                acc[keyName] = {
                    value: 0,
                    count: 0
                };
            }
            acc[keyName].value += entry[key];
            acc[keyName].count += 1;
            return acc;
        }, {});

        return Object.entries(aggregates).map(([keyName, values]) => {
            const [cropName, month] = keyName.split(' - ');
            return {
                cropName,
                month,
                averageValue: values.value / values.count
            };
        });
    };

    // Find the best month range for the crop
    const peakMonthRange = bestMonthRange(cropName, averageByMonth(data, key));

    // Construct interpretation
    const uniqueYears = Array.from(new Set(data.map(entry => entry.monthYear.split(' ')[1]))).sort((a, b) => a - b);
    const yearRange = uniqueYears.length === 1
        ? uniqueYears[0]
        : `${Math.min(...uniqueYears)}-${Math.max(...uniqueYears)}`;

    let interpretation = `From ${yearRange}, the average ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} for <strong>${cropName}</strong> was ${result.average.toFixed(2)} units per hectare.`;

    if (result.growthRateLatestYear !== 0 && result.performance !== 'Insufficient data') {
        interpretation += ` Over the period, the crop experienced an overall growth rate of ${result.growthRateOverall}%, with a growth rate of ${result.growthRateLatestYear}% in the most recent year, indicating a performance level of ${result.performance}.`;
    }

    if (peakMonthRange !== 'No data') {
        interpretation += ` The <strong>${cropName}</strong> appears to peak in the <strong>${peakMonthRange}</strong>.`;
    }

    interpretation += `</p>`;

    return interpretation;
}

// Find the best month range for each crop
const bestMonthRange = (cropName, averageByMonth) => {
    const monthlyData = averageByMonth.filter(item => item.cropName === cropName);
    if (monthlyData.length === 0) return 'No data';

    // Group by months into ranges
    const monthRanges = [
        { range: 'Jan-Mar', months: ['January', 'February', 'March'] },
        { range: 'Apr-Jun', months: ['April', 'May', 'June'] },
        { range: 'Jul-Sep', months: ['July', 'August', 'September'] },
        { range: 'Oct-Dec', months: ['October', 'November', 'December'] }
    ];

    const averageRange = monthRanges.map(range => {
        const rangeData = monthlyData.filter(item => range.months.includes(item.month));
        const average = rangeData.reduce((sum, item) => sum + item.averageValue, 0) / rangeData.length;
        return { range: range.range, average };
    });

    // Find the best range
    const bestRange = averageRange.reduce((best, current) => {
        return current.average > best.average ? current : best;
    }, { average: -Infinity });

    return bestRange.range;
};


$(document).ready(function() {
    $('.download-btn').click(function() {
        // Call the downloadDialog method and handle the promise
        Dialog.downloadDialog().then(format => {
            console.log(format);  // This will log the format (e.g., 'csv', 'xlsx', or 'pdf')
            download(format, currentType, downloadData);
        }).catch(error => {
            console.error('Error:', error);  // Handle any errors that occur
        });
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
    // Define the header mapping
    const headerMap = {
        cropName: 'Crop Name',
        season: 'Season',
        monthYear: 'Month-Year',
        volumeProduction: 'Average Volume Production (mt/ha)',
        incomePerHectare: 'Average Income / ha',
        benefitPerHectare: 'Average Profit / ha',
        price: 'Price (kg)',
        pestOccurrence: 'Pest Observed',
        diseaseOccurrence: 'Disease Observed',
        totalPlanted: 'Total Planted'
    };

    // Always include these headers for both monthly and yearly data
    const alwaysIncludedHeaders = ['cropName', 'season', 'monthYear'];

    // Dynamically include other headers based on filename
    const additionalHeaders = [];
    const filenameLower = filename.toLowerCase();

    if (filenameLower.includes('volumeproduction')) {
        additionalHeaders.push('volumeProduction');
    }
    if (filenameLower.includes('incomeperhectare')) {
        additionalHeaders.push('incomePerHectare');
    }
    if (filenameLower.includes('benefitperhectare')) {
        additionalHeaders.push('benefitPerHectare');
    }
    if (filenameLower.includes('price')) {
        additionalHeaders.push('price');
    }
    if (filenameLower.includes('pestoccurrence')) {
        additionalHeaders.push('pestOccurrence');
    }
    if (filenameLower.includes('diseaseoccurrence')) {
        additionalHeaders.push('diseaseOccurrence');
    }
    if (filenameLower.includes('totalplanted')) {
        additionalHeaders.push('totalPlanted');
    }

    // ======= MONTHLY DATA SECTION =======
    const headersToInclude = [...alwaysIncludedHeaders, ...additionalHeaders];
    const mappedHeaders = headersToInclude.map(key => headerMap[key]);

    const monthlyCSVData = [
        'Monthly Data',
        mappedHeaders.join(','),
        ...data.map(row => headersToInclude.map(key => {
            const value = row[key];
            // Format specific columns with peso sign
            if (key === 'incomePerHectare' || key === 'benefitPerHectare' || key === 'price') {
                return value ? `"₱${parseFloat(value).toFixed(2)}"` : '';
            }
            return escapeCSVValue(value);
        }).join(','))
    ].join('\n');

    // ======= YEARLY DATA SECTION =======
    const yearlyData = {};
    data.forEach(row => {
        const year = new Date(row.monthYear).getFullYear();
        const cropSeasonKey = `${row.cropName}-${row.season}`;

        if (!yearlyData[year]) {
            yearlyData[year] = {};
        }

        if (!yearlyData[year][cropSeasonKey]) {
            yearlyData[year][cropSeasonKey] = {
                cropName: row.cropName,
                season: row.season,
                count: 0,
                sums: {}
            };
            additionalHeaders.forEach(header => {
                yearlyData[year][cropSeasonKey].sums[header] = 0;
            });
        }

        yearlyData[year][cropSeasonKey].count++;
        additionalHeaders.forEach(header => {
            yearlyData[year][cropSeasonKey].sums[header] += parseFloat(row[header]) || 0;
        });
    });

    const yearlyHeaders = ['Year', 'Crop Name', 'Season', ...additionalHeaders.map(header => headerMap[header])];
    const yearlyCSVData = [
        '\nYearly Data',
        yearlyHeaders.join(','),
        ...Object.entries(yearlyData).flatMap(([year, cropSeasons]) =>
            Object.values(cropSeasons).map(cropSeason => {
                const row = [year, cropSeason.cropName, cropSeason.season];
                additionalHeaders.forEach(header => {
                    const average = (cropSeason.sums[header] / cropSeason.count).toFixed(2);
                    row.push(average);
                });
                return row.join(',');
            })
        )
    ].join('\n');

    // Combine monthly and yearly data into a single CSV
    const completeCSVData = [monthlyCSVData, yearlyCSVData].join('\n');

    // Create CSV download
    const blob = new Blob([completeCSVData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let season = $("#season").val();
    let crop = $("#crop").val();
    crop = crop.charAt(0).toUpperCase() + crop.slice(1);
    season = season.charAt(0).toUpperCase() + season.slice(1);
    filename = crop + "_" + season + "_" + downloadYR + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadExcel(filename, data) {
    // Define the header mapping
    const headerMap = {
        monthYear: 'Month Year',
        cropName: 'Crop Name',
        season: 'Season',
        volumeProduction: 'Average Volume Production (mt/ha)',
        incomePerHectare: 'Average Income / ha',
        benefitPerHectare: 'Average Profit / ha',
        price: 'Price (kg)',
        pestOccurrence: 'Pest Observed',
        diseaseOccurrence: 'Disease Observed',
        totalPlanted: 'Total Planted'
    };

    console.log(data);

    // Always include these three headers
    const alwaysIncludedHeaders = ['monthYear', 'cropName', 'season'];

    // Dynamically include other headers based on filename
    const additionalHeaders = [];

    const filenameLower = filename.toLowerCase();

    if (filenameLower.includes('volumeproduction')) {
        additionalHeaders.push('volumeProduction');
    }
    if (filenameLower.includes('incomeperhectare')) {
        additionalHeaders.push('incomePerHectare');
    }
    if (filenameLower.includes('benefitperhectare')) {
        additionalHeaders.push('benefitPerHectare');
    }
    if (filenameLower.includes('price')) {
        additionalHeaders.push('price');
    }
    if (filenameLower.includes('pestoccurrence')) {
        additionalHeaders.push('pestOccurrence');
    }
    if (filenameLower.includes('diseaseoccurrence')) {
        additionalHeaders.push('diseaseOccurrence');
    }
    if (filenameLower.includes('totalplanted')) {
        additionalHeaders.push('totalPlanted');
    }

    // Define the order of headers to include (first three + dynamically added)
    const headersToInclude = [...alwaysIncludedHeaders, ...additionalHeaders];

    // Map headers to the desired names
    const mappedHeaders = headersToInclude.map(key => headerMap[key]);

    // Filter data to match the new headers
    const filteredData = data.map(row => {
        const filteredRow = {};
        headersToInclude.forEach(key => {
            filteredRow[headerMap[key]] = row[key];
        });
        return filteredRow;
    });

    // Create a new workbook and add the main worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly');

    // Add filtered data to the worksheet
    worksheet.addRow(mappedHeaders);
    filteredData.forEach(row => {
        worksheet.addRow(headersToInclude.map(header => {
            let value = row[headerMap[header]];
            
            // Format specific columns with decimal places (e.g., income, benefit, price)
            if (header === 'incomePerHectare' || header === 'benefitPerHectare' || header === 'price') {
                value = value ? `₱${parseFloat(value).toFixed(2)}` : ''; // Add decimal formatting and peso sign
            } else if (typeof value === 'number') {
                value = value.toFixed(2); // Add decimal formatting for other numeric columns
            }
            
            return value;
        }));
    });    

    // Define header and data style (same as before)
    const headerStyle = {
        font: {
            name: "Calibri",
            size: 12,
            bold: true,
            color: { argb: "FFFFFFFF" } // White color
        },
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: "B1BA4D" } // Green fill color
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
            top: { style: 'thin', color: { argb: "FF000000" } }, // Black border
            right: { style: 'thin', color: { argb: "FF000000" } },
            bottom: { style: 'thin', color: { argb: "FF000000" } },
            left: { style: 'thin', color: { argb: "FF000000" } }
        }
    };

    const dataStyle = {
        font: {
            name: "Calibri",
            size: 11
        },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: {
            top: { style: 'thin', color: { argb: "FF000000" } }, // Black border
            right: { style: 'thin', color: { argb: "FF000000" } },
            bottom: { style: 'thin', color: { argb: "FF000000" } },
            left: { style: 'thin', color: { argb: "FF000000" } }
        }
    };

    // Apply style to header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = headerStyle;
    });
    headerRow.height = 20; // Set header row height

    // Apply style to data rows
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.style = dataStyle;
            });
        }
    });

    // Set column widths with padding to prevent overflow
    worksheet.columns = mappedHeaders.map(header => ({
        width: Math.max(header.length, 10) + 5
    }));

    // ======= Add Yearly Averages Sheet =======
    const yearlyData = {};
    data.forEach(row => {
        const year = new Date(row.monthYear).getFullYear();
        if (!yearlyData[year]) {
            yearlyData[year] = {
                count: 0,
                sums: {}
            };
            additionalHeaders.forEach(header => {
                yearlyData[year].sums[header] = 0;
            });
        }
        yearlyData[year].count++;
        additionalHeaders.forEach(header => {
            yearlyData[year].sums[header] += parseFloat(row[header]) || 0;
        });
    });

    // Extract cropName and season from the first row of data (assuming they are consistent across all rows)
    const cropName = data[0].cropName;
    const season = data[0].season;

    // Calculate the averages
    const yearlyAverages = Object.keys(yearlyData).map(year => {
        const averages = { Year: year, CropName: cropName, Season: season };
        additionalHeaders.forEach(header => {
            averages[headerMap[header]] = (yearlyData[year].sums[header] / yearlyData[year].count).toFixed(2);
        });
        return averages;
    });

    // Add the yearly averages to a new worksheet
    const yearlyWorksheet = workbook.addWorksheet('Yearly');

    // Define headers for the yearly sheet, including Crop Name and Season
    const yearlyHeaders = ['Year', 'Crop Name', 'Season', ...additionalHeaders.map(header => headerMap[header])];
    yearlyWorksheet.addRow(yearlyHeaders);

    // Add the calculated yearly averages to the worksheet
    yearlyAverages.forEach(row => {
        yearlyWorksheet.addRow(Object.values(row));
    });

    // Apply styles to the new sheet
    const yearlyHeaderRow = yearlyWorksheet.getRow(1);
    yearlyHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.style = headerStyle;
    });
    yearlyHeaderRow.height = 20;

    yearlyWorksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (rowNumber > 1) {
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.style = dataStyle;
            });
        }
    });

    // Set column widths
    yearlyWorksheet.columns = yearlyHeaders.map(header => ({
        width: Math.max(header.length, 10) + 5
    }));


    // Write workbook to browser
    workbook.xlsx.writeBuffer().then(function(buffer) {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let season = $("#season").val();
        let crop = $("#crop").val();
        crop = crop.charAt(0).toUpperCase() + crop.slice(1);
        season = season.charAt(0).toUpperCase() + season.slice(1);
        filename = crop + "_" + season + "_" + downloadYR + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    });
}


function downloadPDF(filename) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Function to add an image to the PDF
    const addImageToPDF = (canvas, x, y, width, height) => {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', x, y, width, height);
    };

    // Function to add text to the PDF
    const addTextToPDF = (text, x, y) => {
        const textWidth = pageWidth - 2 * margin;
        const splitText = doc.splitTextToSize(text, textWidth);
    
        splitText.forEach(line => {
            const lineWidth = doc.getTextWidth(line);
            const textX = (pageWidth - lineWidth) / 2; // Center horizontally
            if (y > pageHeight - margin) {
                doc.addPage(); // Add a new page if needed
                y = margin; // Reset text margin for the new page
            }
            doc.text(line, textX, y);
            y += 10; // Line height
        });
    
        return y; // Return updated y-coordinate
    };

    let season = $("#season").val();
    let crop = $("#crop").val();
    crop = crop.charAt(0).toUpperCase() + crop.slice(1);
    season = season.charAt(0).toUpperCase() + season.slice(1);
    filename = crop + "_" + season + "_" + downloadYR + "_" + filename.charAt(0).toUpperCase() + filename.slice(1);

    // Add content from seasonalTrendChart
    html2canvas(document.getElementById('seasonalTrendChart'), {
        scale: 2,
        useCORS: true
    }).then(canvas => {
        addImageToPDF(canvas, 10, 10, 190, 80); // Add seasonalTrendChart to PDF

        let currentY = 100; // Initial y-coordinate after the first image

        const interpretationText = document.querySelector('#interpretation').innerText.trim();
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        currentY = addTextToPDF(interpretationText, 10, currentY); // Add interpretation text

        // Add content from totalPerYearChart
        html2canvas(document.getElementById('totalPerYearChart'), {
            scale: 2,
            useCORS: true
        }).then(canvas => {
            addImageToPDF(canvas, 10, currentY, 190, 80); // Add totalPerYearChart to PDF

            doc.save(filename); // Save the PDF
        });
    });

    addDownload(filename, 'PDF');
}
