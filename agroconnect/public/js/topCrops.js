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
            disease: entry.diseaseOccurrence === 0 ? 0 : -entry.diseaseOccurrence
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

    const parseMonthYear = (monthYear) => {
        const [month, year] = monthYear.split(' ');
        return { month, year };
    };

    const aggregateMonthlyData = (data) => {
        return data.reduce((acc, entry) => {
            const { month, year } = parseMonthYear(entry.monthYear);
            const key = `${entry.cropName} - ${entry.variety} - ${month} ${year}`;
            if (!acc[key]) {
                acc[key] = { income: 0, count: 0 };
            }
            acc[key].income += entry.incomePerHectare;
            acc[key].count += 1;
            return acc;
        }, {});
    };

    const findPeakAndLowestMonth = (monthlyData) => {
        const peakAndLowest = {};
        for (const [key, values] of Object.entries(monthlyData)) {
            const [cropName, variety, monthYear] = key.split(' - ');
            const month = monthYear.split(' ')[0];
            const averageIncome = values.income / values.count;

            if (!peakAndLowest[`${cropName} - ${variety}`]) {
                peakAndLowest[`${cropName} - ${variety}`] = {
                    peak: { month: '', income: -Infinity },
                    lowest: { month: '', income: Infinity }
                };
            }

            if (averageIncome > peakAndLowest[`${cropName} - ${variety}`].peak.income) {
                peakAndLowest[`${cropName} - ${variety}`].peak = { month, income: averageIncome };
            }
            if (averageIncome < peakAndLowest[`${cropName} - ${variety}`].lowest.income) {
                peakAndLowest[`${cropName} - ${variety}`].lowest = { month, income: averageIncome };
            }
        }
        return peakAndLowest;
    };

    const aggregatedData = data.reduce((acc, entry) => {
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

    const averagedData = Object.entries(aggregatedData).map(([key, values]) => ({
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

    const monthlyData = aggregateMonthlyData(data);
    const peakAndLowest = findPeakAndLowestMonth(monthlyData);

    const ranges = {
        volumeProduction: calculateMinMax(averagedData, 'volumeProductionPerHectare'),
        income: calculateMinMax(averagedData, 'incomePerHectare'),
        benefit: calculateMinMax(averagedData, 'benefitPerHectare'),
        price: calculateMinMax(averagedData, 'price'),
        pest: calculateMinMax(averagedData, 'pestOccurrence'),
        disease: calculateMinMax(averagedData, 'diseaseOccurrence')
    };

    const scoredData = averagedData.map(entry => ({
        ...entry,
        compositeScore: calculateCompositeScore(entry, ranges),
        peakMonth: peakAndLowest[`${entry.cropName} - ${entry.variety}`]?.peak.month || 'N/A',
        lowestMonth: peakAndLowest[`${entry.cropName} - ${entry.variety}`]?.lowest.month || 'N/A'
    }));

    const rankedData = scoredData.sort((a, b) => b.compositeScore - a.compositeScore);

    // Define performance thresholds
    const numEntries = rankedData.length;
    const topThreshold = rankedData[Math.floor(numEntries * 0.1)]?.compositeScore || -Infinity;
    const highThreshold = rankedData[Math.floor(numEntries * 0.3)]?.compositeScore || -Infinity;
    const lowThreshold = rankedData[Math.floor(numEntries * 0.7)]?.compositeScore || Infinity;
    const bottomThreshold = rankedData[Math.floor(numEntries * 0.9)]?.compositeScore || Infinity;

    return rankedData.map((entry, index) => {
        const rank = index + 1;
        let performance;
        
        if (entry.compositeScore >= topThreshold) {
            performance = "high";
        } else if (entry.compositeScore >= highThreshold) {
            performance = "above average";
        } else if (entry.compositeScore >= lowThreshold) {
            performance = "average";
        } else {
            performance = "poor";
        }

        return {
            ...entry,
            remarks: `Rank ${rank}: This variety (${entry.variety}) of ${entry.cropName} has a total planted area of <strong>${entry.totalPlanted.toFixed(2)}</strong> units. ` +
                `It achieves an impressive average income of <strong>${entry.incomePerHectare.toFixed(2)}</strong> per hectare, ` +
                `with a volume production rate of <strong>${entry.volumeProductionPerHectare.toFixed(2)}</strong> per hectare and a benefit of <strong>${entry.benefitPerHectare.toFixed(2)}</strong> per hectare. ` +
                `The average price for this variety is <strong>${entry.price.toFixed(2)}</strong>. ` +
                `Pest and disease occurrences are <strong>${entry.pestOccurrence.toFixed(2)}</strong> and <strong>${entry.diseaseOccurrence.toFixed(2)}</strong>, respectively. ` +
                `The peak income month is <strong>${entry.peakMonth}</strong>, while the lowest income month is <strong>${entry.lowestMonth}</strong>. ` +
                `Compared to other crops and varieties, this variety demonstrates <strong>${performance}</strong> performance in terms of income generation.`
        };
    });
}

    displayTopCrops(data) {
        const tableBody = $('#cropsTable tbody');
        tableBody.empty(); // Clear existing rows

        data.forEach(crop => {
            const row = `<tr>
                <td>${crop.cropName}</td>
                <td>${crop.variety}</td>
                <td>${crop.type}</td>
                <td>${crop.remarks}</td>
            </tr>`;
            tableBody.append(row);
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

        return await getCropData(production, price, pest, disease, crops, type);
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
    // Determine which headers to include by excluding headers containing 'Rank'
    const keys = Object.keys(data[0]).filter(key => !key.toLowerCase().includes('rank') && key !== 'remarks');
    const headers = keys.map(formatHeader);

    const csv = [
        headers.join(','),
        ...data
            .map(row => keys.map(key => escapeCSVValue(row[key])).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


function downloadExcel(filename, data) {
    // Determine which headers to include by excluding headers containing 'Rank'
    const headersToInclude = Object.keys(data[0]).filter(key => !key.toLowerCase().includes('rank') && key !== 'remarks');

    // Filter data to remove 'Rank' headers and 'remarks'
    const filteredData = data.map(row => {
        const filteredRow = {};
        headersToInclude.forEach(key => {
            filteredRow[key] = row[key];
        });
        return filteredRow;
    });

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write workbook to file
    XLSX.writeFile(wb, filename);
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
}

// Function to extract plain text from HTML
function extractTextFromHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}
