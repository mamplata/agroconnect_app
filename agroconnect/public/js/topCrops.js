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

        const normalize = (value, min, max) => (value - min) / (max - min);

        const calculateCompositeScore = (entry, ranges) => {
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
            compositeScore: calculateCompositeScore(entry, ranges)
        }));

        const rankedData = scoredData.sort((a, b) => b.compositeScore - a.compositeScore);

        return rankedData.map((entry, index) => {
            const rank = index + 1;
            const performance = rank === 1 ? "highest" : rank === rankedData.length ? "lowest" : "average";

            return {
                ...entry,
                remarks: `Rank ${rank}: This variety (${entry.variety}) of ${entry.cropName} has a total planted area of ${entry.totalPlanted.toFixed(2)} units. ` +
                         `It averages ${entry.volumeProductionPerHectare.toFixed(2)} for volume production per hectare, ` +
                         `with an income of ${entry.incomePerHectare.toFixed(2)} per hectare and a benefit of ${entry.benefitPerHectare.toFixed(2)} per hectare. ` +
                         `The average price is ${entry.price.toFixed(2)}. ` +
                         `Pest and disease occurrences are ${entry.pestOccurrence.toFixed(2)} and ${entry.diseaseOccurrence.toFixed(2)}, respectively. ` +
                         `Compared to all other crops and varieties, this variety is ${performance} in terms of overall performance.`
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
    const keys = Object.keys(data[0]).filter(key => key !== 'remarks');
    const headers = keys.map(formatHeader);

    const csv = [
        headers.join(','),
        ...data.map(row => keys.map(key => escapeCSVValue(row[key])).join(','))
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
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename);
}

function downloadPDF(filename, data) {
    const doc = new jsPDF();

    const columns = Object.keys(data[0]).filter(key => key !== 'remarks');
    const headers = columns.map(formatHeader);

    doc.autoTable({
        head: [headers],
        body: data.map(row => columns.map(key => row[key])),
        theme: 'striped'
    });

    doc.save(filename);
}
