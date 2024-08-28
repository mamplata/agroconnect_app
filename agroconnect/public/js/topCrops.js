import Dialog from '../management/components/helpers/Dialog.js';
import { getCrop, getProduction, getPrice, getPest, getDisease, addDownload} from './fetch.js';
import * as stats from './statistics.js';
let crops = [];
let dataEntry = []; // Global variable to store all entries

// Fetch initial crop data
async function initializeCrops() {
    try {
        crops = await getCrop(); // Fetch and initialize crops data
    } catch (error) {
        console.error('Failed to initialize crops:', error);
    }
}

function calculateOccurrencePercentage(occurence, totalPlanted) {
    if (totalPlanted === 0) {
        return 0; // Avoid division by zero
    }
    return (occurence / totalPlanted) * 100;
}

class TopCrops {
    constructor(season, type) {
        this.season = season;
        this.type = type;
        this.initialize();
    }

    async initialize() {
        try {
            const cropData = await main(this.season, this.type);
            const topCrops = this.generateTopCrops(cropData);
            this.displayTopCrops(topCrops);
            dataEntry = topCrops;
            
        } catch (error) {
            console.error('Failed to initialize TopCrops:', error);
        }
    }

    generateTopCrops(data) {
        const calculateMinMax = (data, key) => {
            const values = data.map(entry => entry[key]);
            return { min: Math.min(...values), max: Math.max(...values) };
        };
    
        const normalize = (value, min, max) => {
            if (max === min) return 0; // Avoid division by zero
            return Math.max(0, (value - min) / (max - min));
        };
    
        const calculateCompositeScore = (entry, ranges) => {
            const indicators = {
                volumeProduction: entry.volumeProductionPerHectare,
                income: entry.incomePerHectare,
                benefit: entry.benefitPerHectare,
                price: entry.price,
                pest: entry.pestOccurrence === 0 ? 0 : -entry.pestOccurrence,
                disease: entry.diseaseOccurrence === 0 ? 0 : -entry.diseaseOccurrence,
                totalPlanted: entry.totalPlanted // Include totalPlanted here
            };
    
            const normalizedIndicators = {
                volumeProduction: normalize(indicators.volumeProduction, ranges.volumeProduction.min, ranges.volumeProduction.max),
                income: normalize(indicators.income, ranges.income.min, ranges.income.max),
                benefit: normalize(indicators.benefit, ranges.benefit.min, ranges.benefit.max),
                price: normalize(indicators.price, ranges.price.min, ranges.price.max),
                pest: normalize(indicators.pest, -ranges.pest.max, -ranges.pest.min),
                disease: normalize(indicators.disease, -ranges.disease.max, -ranges.disease.min),
                totalPlanted: normalize(indicators.totalPlanted, ranges.totalPlanted.min, ranges.totalPlanted.max) // Normalize totalPlanted
            };
    
            return (
                0.15 * normalizedIndicators.volumeProduction +
                0.15 * normalizedIndicators.income +
                0.15 * normalizedIndicators.benefit +
                0.15 * normalizedIndicators.price +
                0.1 * normalizedIndicators.pest +
                0.1 * normalizedIndicators.disease +
                0.2 * normalizedIndicators.totalPlanted // Adjust weight if necessary
            );
        };
    
        // Aggregate data by crop, variety, and month
        const aggregatedData = data.reduce((acc, entry) => {
            const key = `${entry.cropName} - ${entry.variety} - ${entry.monthYear}`;
            if (!acc[key]) {
                acc[key] = {
                    volumeProductionPerHectare: 0,
                    incomePerHectare: 0,
                    benefitPerHectare: 0,
                    price: 0,
                    pestOccurrence: 0,
                    diseaseOccurrence: 0,
                    totalPlanted: 0, // Initialize totalPlanted
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
            item.totalPlanted += entry.totalPlanted; // Aggregate totalPlanted
            item.count += 1;
            return acc;
        }, {});
    
        // Aggregate data by crop and variety
        const aggregatedDataByCrop = Object.entries(aggregatedData).reduce((acc, [key, values]) => {
            const [cropName, variety, monthYear] = key.split(' - ');
            if (!acc[`${cropName} - ${variety}`]) {
                acc[`${cropName} - ${variety}`] = {
                    volumeProductionPerHectare: 0,
                    incomePerHectare: 0,
                    benefitPerHectare: 0,
                    price: 0,
                    pestOccurrence: 0,
                    diseaseOccurrence: 0,
                    totalPlanted: 0, // Initialize totalPlanted
                    count: 0,
                    monthlyData: []
                };
            }
            const item = acc[`${cropName} - ${variety}`];
            item.volumeProductionPerHectare += values.volumeProductionPerHectare / values.count;
            item.incomePerHectare += values.incomePerHectare / values.count;
            item.benefitPerHectare += values.benefitPerHectare / values.count;
            item.price += values.price / values.count;
            item.pestOccurrence += values.pestOccurrence / values.count;
            item.diseaseOccurrence += values.diseaseOccurrence / values.count;
            item.totalPlanted += values.totalPlanted / values.count; // Aggregate totalPlanted
            item.count += 1;
            item.monthlyData.push({
                monthYear,
                volumeProductionPerHectare: values.volumeProductionPerHectare / values.count,
                incomePerHectare: values.incomePerHectare / values.count,
                benefitPerHectare: values.benefitPerHectare / values.count,
                price: values.price / values.count,
                pestOccurrence: values.pestOccurrence / values.count,
                diseaseOccurrence: values.diseaseOccurrence / values.count,
                totalPlanted: values.totalPlanted / values.count // Include totalPlanted in monthlyData
            });
            return acc;
        }, {});
    
        // Calculate ranges for normalization
        const ranges = {
            volumeProduction: calculateMinMax(Object.values(aggregatedDataByCrop), 'volumeProductionPerHectare'),
            income: calculateMinMax(Object.values(aggregatedDataByCrop), 'incomePerHectare'),
            benefit: calculateMinMax(Object.values(aggregatedDataByCrop), 'benefitPerHectare'),
            price: calculateMinMax(Object.values(aggregatedDataByCrop), 'price'),
            pest: calculateMinMax(Object.values(aggregatedDataByCrop), 'pestOccurrence'),
            disease: calculateMinMax(Object.values(aggregatedDataByCrop), 'diseaseOccurrence'),
            totalPlanted: calculateMinMax(Object.values(aggregatedDataByCrop), 'totalPlanted') // Calculate range for totalPlanted
        };
    
        // Calculate growth rate over time
        const calculateGrowthRateOverTime = (monthlyData) => {
            if (monthlyData.length < 2) return 0; // Not enough data to calculate growth rate
    
            let initial = monthlyData[0].incomePerHectare;
            let final = monthlyData[monthlyData.length - 1].incomePerHectare;
            return (final - initial) / initial;
        };
    
        const scoredData = Object.entries(aggregatedDataByCrop).map(([key, values]) => {
            const [cropName, variety] = key.split(' - ');
            const growthRateOverTime = calculateGrowthRateOverTime(values.monthlyData);
    
            return {
                cropName,
                variety,
                volumeProductionPerHectare: values.volumeProductionPerHectare,
                incomePerHectare: values.incomePerHectare,
                benefitPerHectare: values.benefitPerHectare,
                price: values.price,
                pestOccurrence: values.pestOccurrence,
                diseaseOccurrence: values.diseaseOccurrence,
                totalPlanted: values.totalPlanted, // Include totalPlanted
                growthRate: calculateCompositeScore(values, ranges),
                growthRateOverTime // Added growth rate over time
            };
        });

    const rankedData = scoredData.sort((a, b) => b.growthRate - a.growthRate);

    // Define performance thresholds
    const numEntries = rankedData.length;
    const topThreshold = rankedData[Math.floor(numEntries * 0.1)]?.growthRate || -Infinity;
    const highThreshold = rankedData[Math.floor(numEntries * 0.3)]?.growthRate || -Infinity;
    const lowThreshold = rankedData[Math.floor(numEntries * 0.7)]?.growthRate || Infinity;


        // Aggregate data by month for performance analysis
        const monthlyAggregates = data.reduce((acc, entry) => {
            const [month] = entry.monthYear.split(' ');
            const key = `${entry.cropName} - ${entry.variety} - ${month}`;
            if (!acc[key]) {
                acc[key] = {
                    income: 0,
                    count: 0
                };
            }
            acc[key].income += entry.incomePerHectare;
            acc[key].count += 1;
            return acc;
        }, {});
    
        // Calculate average income by month
        const averageIncomeByMonth = Object.entries(monthlyAggregates).map(([key, values]) => {
            const [cropName, variety, month] = key.split(' - ');
            return {
                cropName,
                variety,
                month,
                averageIncome: values.income / values.count
            };
        });
    
        // Find the best month range for each crop variety
        const bestMonthRange = (cropName, variety) => {
            const monthlyData = averageIncomeByMonth.filter(item => item.cropName === cropName && item.variety === variety);
            if (monthlyData.length === 0) return 'No data';
    
            // Group by months into ranges
            const monthRanges = [
                { range: 'Jan-Mar', months: ['January', 'February', 'March'] },
                { range: 'Apr-Jun', months: ['April', 'May', 'June'] },
                { range: 'Jul-Sep', months: ['July', 'August', 'September'] },
                { range: 'Oct-Dec', months: ['October', 'November', 'December'] }
            ];
    
            const averageIncomeByRange = monthRanges.map(range => {
                const rangeData = monthlyData.filter(item => range.months.includes(item.month));
                const averageIncome = rangeData.reduce((sum, item) => sum + item.averageIncome, 0) / rangeData.length;
                return { range: range.range, averageIncome };
            });
    
            // Find the best range
            const bestRange = averageIncomeByRange.reduce((best, current) => {
                return current.averageIncome > best.averageIncome ? current : best;
            }, { averageIncome: -Infinity });
    
            return bestRange.range;
        };

    // Add performance, best month range, and remarks
    const topCropsWithRemarks = rankedData.map((entry, index) => {
        const rank = index + 1;
        let performance;

        if (entry.growthRate < 0) {
            performance = "poor";
        } else if (entry.growthRate >= topThreshold) {
            performance = "excellent";
        } else if (entry.growthRate >= highThreshold) {
            performance = "above average";
        } else if (entry.growthRate >= lowThreshold) {
            performance = "average";
        } else {
            performance = "below average";
        }

        const bestMonthRangeForCrop = bestMonthRange(entry.cropName, entry.variety);

        return {
            ...entry,
            type: $('#typeSelect').val(),
            remarks: `<strong>Rank ${rank}</strong>: <p class="text-justify">This variety (${entry.variety}) of ${entry.cropName} has a growth rate of <strong>${(entry.growthRate * 100).toFixed(2)}%</strong>, indicating its current performance. ` +
                `The growth rate over time is <strong>${(entry.growthRateOverTime * 100).toFixed(2)}%</strong>, which reflects how its performance has changed over the evaluated period. ` +
                `Compared to other crops and varieties, this variety demonstrates <strong>${performance}</strong> performance. ` +
                `The ideal months for this crop variety are <strong>${bestMonthRangeForCrop}</strong>.</p>` +
                `<p class="text-center"></br> Average production volume: <strong>${entry.volumeProductionPerHectare} per hectare/ha</strong>` +
                `</br> Average price: <strong>₱${parseFloat(entry.price).toLocaleString()}</strong>` +
                `</br> Average income: <strong>₱${parseFloat(entry.incomePerHectare).toLocaleString()} per hectare/ha</strong>` +
                `</br> Average profit: <strong>₱${parseFloat(entry.benefitPerHectare).toLocaleString()} per hectare/ha</strong>` +
                `</br> Pest occurrence: <strong>${entry.pestOccurrence} (${calculateOccurrencePercentage(entry.pestOccurrence, entry.totalPlanted).toFixed(2)}%)</strong>` +
                `</br> Disease occurrence: <strong>${entry.diseaseOccurrence} (${calculateOccurrencePercentage(entry.diseaseOccurrence, entry.totalPlanted).toFixed(2)}%)</strong><p>`
                
        };
    });

    return topCropsWithRemarks;
}

    

 displayTopCrops(data) {
    const tableBody = $('#cropsTable tbody');
    tableBody.empty(); // Clear existing rows

    data.forEach(crop => {
        // Find matching crop details
        const cropDetails = crops.find(c => c.cropName === crop.cropName && c.variety === crop.variety);

        // Default values if no matching crop is found
        const cropImg = cropDetails ? cropDetails.cropImg : '';
        const description = cropDetails ? cropDetails.description : 'No description available';
        const cropVariety = `${crop.cropName} - ${crop.variety}`;

        // Create table row with View button
        const row = `<tr class="text-center">
            <td>${crop.cropName}</td>
            <td>${crop.variety}</td>
            <td>${crop.type}</td>
            <td>${crop.remarks}</td>
            <td><button class="btn btn-green view-btn" data-img="${cropImg}" data-description="${description}" data-variety="${cropVariety}">View</button></td>
        </tr>`;
        tableBody.append(row);
    });

    // Attach click event handler to View buttons
    $('.view-btn').on('click', async function() {
        const imgSrc = $(this).data('img');
        const desc = $(this).data('description');
        const variety = $(this).data('variety');

        // Call the custom modal function
        const res = await Dialog.showCropModal(imgSrc, desc, variety);

        if (res.operation === Dialog.OK) {
            console.log('Modal was closed by the user');
        } else {
            console.log('Modal was not closed');
        }
    });
}
}

$(document).ready(async function() {
    await initializeCrops();
    new TopCrops("Dry", "Vegetables");

    $('#seasonSelect, #typeSelect').on('change', function() {
        const season = $('#seasonSelect').val();
        const type = $('#typeSelect').val();
        new TopCrops(season, type);
    });

    $('#searchInput').on('keyup', function() {
        const value = $(this).val().toLowerCase();
        $('#cropsTable tbody tr').filter(function() {
            $(this).toggle($(this).find('td:eq(0)').text().toLowerCase().indexOf(value) > -1 || 
                           $(this).find('td:eq(1)').text().toLowerCase().indexOf(value) > -1);
        });
    });

    $('.download-btn').click(function() {
        $('#downloadModal').modal('show');
    });

    $('.download-option').click(function() {
        const format = $(this).data('format');
        const currentType = $('#typeSelect').val();
        download(format, currentType, dataEntry);
    });
});

async function main(season, type) {
    try {
        let production = await getProduction("", season);
        let price = await getPrice("", season);
        let pest = await getPest("", season);
        let disease = await getDisease("", season);

        production = production.map(entry => ({ ...entry, type }));
        price = price.map(entry => ({ ...entry, type }));
        pest = pest.map(entry => ({ ...entry, type }));
        disease = disease.map(entry => ({ ...entry, type }));

        return await stats.getCropData(production, price, pest, disease, crops, type);
    } catch (error) {
        console.error('An error occurred in the main function:', error);
    }
}

function download(format, type, data) {
    const filename = `${type.toLowerCase()}.${format}`;
    if (format === 'csv') {
        downloadCSV(filename, data);
    } else if (format === 'xlsx') {
        downloadExcel(filename, data);
    } else if (format === 'pdf') {
        downloadPDF(filename, data);
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
    return value; // Return escaped value
}

function downloadCSV(filename, data) {
    // Define the header mapping
    const headerMap = {
        cropName: 'Crop Name',
        variety: 'Variety',
        type: 'Type',
        volumeProductionPerHectare: 'Average Volume Production (mt/ha)',
        incomePerHectare: 'Average Income / ha ',
        benefitPerHectare: 'Average Profit / ha',
        price: 'Price (kg)',
        pestOccurrence: 'Pest Observed',
        diseaseOccurrence: 'Disease Observed',
        totalPlanted: 'Total Planted'
    };

    // Define the order of headers
    const headersToInclude = [
        'cropName',
        'variety',
        'type',
        'volumeProductionPerHectare',
        'incomePerHectare',
        'benefitPerHectare',
        'price',
        'pestOccurrence',
        'diseaseOccurrence',
        'totalPlanted'
    ];

    // Map headers to the desired names
    const headers = headersToInclude.map(key => headerMap[key]);

    // Helper function to escape CSV values
    function escapeCSVValue(value) {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    // Filter data to match the new headers and format values
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headersToInclude.map(key => {
                const value = row[key] !== undefined ? row[key] : ''; // Ensure non-null values
                if (key === 'incomePerHectare' || key === 'benefitPerHectare' || key === 'price') {
                    return value !== '' ? `₱${parseFloat(value).toFixed(2)}` : '';
                }
                return escapeCSVValue(value);
            }).join(',')
        )
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Optional: Log download action
    addDownload(filename, 'CSV');
}

function downloadExcel(filename, data) {
    // Define the header mapping
    const headerMap = {
        cropName: 'Crop Name',
        variety: 'Variety',
        type: 'Type',
        volumeProductionPerHectare: 'Average Volume Production (mt/ha)',
        incomePerHectare: 'Average Income / ha ',
        benefitPerHectare: 'Average Profit / ha',
        price: 'Price (kg)',
        pestOccurrence: 'Pest Observed',
        diseaseOccurrence: 'Disease Observed',
        totalPlanted: 'Total Planted'
    };

    // Define the order of headers
    const headersToInclude = [
        'cropName',
        'variety',
        'type',
        'volumeProductionPerHectare',
        'incomePerHectare',
        'benefitPerHectare',
        'price',
        'pestOccurrence',
        'diseaseOccurrence',
        'totalPlanted'
    ];

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

    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add filtered data to the worksheet
    worksheet.addRow(mappedHeaders);
    filteredData.forEach(row => {
        worksheet.addRow(headersToInclude.map(header => {
            const value = row[headerMap[header]];
            // Format specific columns with peso sign
            if (header === 'incomePerHectare' || header === 'benefitPerHectare' || header === 'price') {
                return value ? `₱${parseFloat(value).toFixed(2)}` : '';
            }
            return value;
        }));
    });

    // Define header and data style
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
        width: Math.max(header.length, 10) + 5 // Ensure minimum width
    }));

    // Write workbook to browser
    workbook.xlsx.writeBuffer().then(function(buffer) {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    });
}


function downloadPDF(filename, data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Specify the columns you want to include in the PDF
    const columns = ['cropName', 'variety', 'type', 'remarks'];
    const headers = columns.map(formatHeader);

    // Create the table using only the specified columns
    doc.autoTable({
        head: [headers],
        body: data.map(row => 
            columns.map(key => key === 'remarks' ? extractTextFromHTML(row[key]) : row[key])
        ),
        theme: 'striped'
    });

    doc.save(filename);
    addDownload(filename, 'PDF');
}

function extractTextFromHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Extract the plain text
    let text = tempDiv.textContent || tempDiv.innerText || '';

    // Remove unnecessary whitespace and normalize special characters
    text = text.replace(/&nbsp;/g, ' ') // Convert non-breaking spaces to regular spaces
               .replace(/[^\w\s.,-]/g, '') // Remove special characters except common symbols
               .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
               .trim(); // Remove leading and trailing spaces

    return text;
}
