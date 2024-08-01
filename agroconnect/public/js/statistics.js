// Helper function to parse date
function parseDate(dateString) {
    return new Date(dateString).getFullYear();
}

// Calculate yearly averages
function calculateYearlyAverages(yearlyData) {
    return Object.keys(yearlyData).map(year => {
        const yearData = yearlyData[year];
        return yearData.reduce((a, b) => a + b, 0) / yearData.length;
    });
}

// Calculate growth rates
function calculateGrowthRates(yearlyAverages, years) {
    let growthRateOverall = 0;
    let growthRateLatestYear = 0;

    if (years.length === 2) {
        const [earliestYear, latestYear] = years;
        const earliestYearAvg = yearlyAverages[years.indexOf(earliestYear)];
        const latestYearAvg = yearlyAverages[years.indexOf(latestYear)];

        growthRateOverall = Math.round(((latestYearAvg - earliestYearAvg) / earliestYearAvg) * 100);
        growthRateLatestYear = growthRateOverall;
    } else if (years.length > 2) {
        const latestYear = years[years.length - 1];
        const previousYear = years[years.length - 2];
        const earliestYearAvg = yearlyAverages[0];
        const latestYearAvg = yearlyAverages[years.indexOf(latestYear)];
        const previousYearAvg = yearlyAverages[years.indexOf(previousYear)];

        growthRateOverall = Math.round(((latestYearAvg - earliestYearAvg) / earliestYearAvg) * 100);
        growthRateLatestYear = Math.round(((latestYearAvg - previousYearAvg) / previousYearAvg) * 100);
    }

    return { growthRateOverall, growthRateLatestYear };
}

// Calculate monthly averages
function calculateMonthlyAverages(monthlyData) {
    return Object.fromEntries(
        Object.entries(monthlyData).map(([month, data]) => [month, data.reduce((a, b) => a + b) / data.length])
    );
}

// Find peak, mid, and lowest months
function findPeakMidLowestMonths(monthlyAverages) {
    const sortedMonths = Object.entries(monthlyAverages).sort(([, a], [, b]) => b - a);
    return {
        monthPeak: sortedMonths[0]?.[0],
        monthLowest: sortedMonths[sortedMonths.length - 1]?.[0],
        monthMid: sortedMonths[Math.floor(sortedMonths.length / 2)]?.[0]
    };
}

// Calculate seasonal index
function calculateSeasonalIndex(yearlyAverages) {
    if (yearlyAverages.length > 1) {
        const latestYearAvg = yearlyAverages[yearlyAverages.length - 1];
        const overallAverage = yearlyAverages.reduce((a, b) => a + b, 0) / yearlyAverages.length;
        return Math.round((latestYearAvg - overallAverage) / overallAverage * 100);
    }
    return 0;
}

// Calculate Z-scores for growth rates
function calculateZScoresForGrowthRates(yearlyAverages, growthRates) {
    const meanGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    const stdDevGrowthRate = Math.sqrt(
        growthRates.reduce((a, b) => a + Math.pow(b - meanGrowthRate, 2), 0) / growthRates.length
    );

    const growthRateZScores = growthRates.map(value => (value - meanGrowthRate) / stdDevGrowthRate);

    return {
        growthRateZScores,
        meanGrowthRateZScore: (growthRates[growthRates.length - 1] - meanGrowthRate) / stdDevGrowthRate
    };
}

// Interpret performance
function interpretPerformance(zScore) {
    if (zScore > 2) return 'Excellent';
    if (zScore > 1) return 'Good';
    if (zScore < -2) return 'Poor';
    if (zScore < -1) return 'Below Average';
    return 'Average';
}

// Main function to interpret totalPlanted data
// Calculate the average performance
function calculateAveragePerformance(zScores) {
    const meanZScore = zScores.reduce((a, b) => a + b, 0) / zScores.length;
    return interpretPerformance(meanZScore);
}

function calculateStatistics(data) {
    const values = data.map(d => d.totalPlanted);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const range = Math.max(...values) - Math.min(...values);

    return { mean, variance, stdDev, range };
}

function isVariationLow(stdDev, threshold = 0.1) {
    return stdDev < threshold;
}

function countTotalPlanted(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropCounts = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalPlanted: 0 };
        }

        acc[monthPlanted][cropName].totalPlanted++;
        return acc;
    }, {});

    return Object.entries(monthCropCounts).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalPlanted }]) => ({
            monthYear: month,
            cropName,
            season,
            totalPlanted
        }))
    );
}

function countTotalPlantedBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const barangayCropCounts = data.reduce((acc, item) => {
        const { barangay, cropName, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { season, totalPlanted: 0 };
        }

        acc[barangay][cropName].totalPlanted++;
        return acc;
    }, {});

    return Object.entries(barangayCropCounts).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalPlanted }]) => ({
            barangay,
            cropName,
            season,
            totalPlanted
        }))
    );
}

function averageVolumeProduction(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropTotals = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, volumeProduction, areaPlanted } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalVolume: 0, totalArea: 0 };
        }

        acc[monthPlanted][cropName].totalVolume += volumeProduction;
        acc[monthPlanted][cropName].totalArea += areaPlanted;

        return acc;
    }, {});

    let dataset = Object.entries(monthCropTotals).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalVolume, totalArea }]) => ({
            monthYear: month,
            cropName,
            season,
            totalVolume: parseFloat(totalVolume.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            volumeProduction: parseFloat((totalVolume / totalArea).toFixed(2)),
        }))
    );
    return dataset;
}

function averageVolumeProductionBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    // Aggregate total volume and area, and count records per barangay and crop
    const barangayCropTotals = data.reduce((acc, item) => {
        const { barangay, cropName, volumeProduction, areaPlanted } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { totalVolume: 0, totalArea: 0, count: 0 };
        }

        acc[barangay][cropName].totalVolume += volumeProduction;
        acc[barangay][cropName].totalArea += areaPlanted;
        acc[barangay][cropName].count++;

        return acc;
    }, {});

    // Transform aggregated data into the desired format
    return Object.entries(barangayCropTotals).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { totalVolume, totalArea, count }]) => ({
            barangay,
            cropName,
            volumeProduction: totalArea > 0 
                ? parseFloat((totalVolume / totalArea).toFixed(2)) 
                : 0,
            averageVolumeProductionPerRecord: count > 0 
                ? parseFloat((totalVolume / count).toFixed(2)) 
                : 0
        }))
    );
}

// Function to determine year range from data
function getYearRange(data) {
    if (data.length === 0) return 'N/A';

    // Extract years from monthYear
    let years = data.map(record => {
        let yearMatch = record.monthYear.match(/\d{4}$/);
        return yearMatch ? parseInt(yearMatch[0], 10) : null;
    }).filter(year => year !== null);

    if (years.length === 0) return 'N/A';

    let minYear = Math.min(...years);
    let maxYear = Math.max(...years);

    // Return year range as a string
    return minYear === maxYear ? `${minYear}` : `${minYear} to ${maxYear}`;
}


function averagePrice(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropTotals = data.reduce((acc, item) => {
        const { monthYear, cropName, season, price } = item;
        let numericalPrice = 0;

        if (typeof price === 'string' && price.includes('-')) {
            const [minPrice, maxPrice] = price.split('-').map(Number);
            numericalPrice = (minPrice + maxPrice) / 2;
        } else {
            numericalPrice = Number(price);
        }

        if (!acc[monthYear]) {
            acc[monthYear] = {};
        }

        if (!acc[monthYear][cropName]) {
            acc[monthYear][cropName] = { season, price: 0, count: 0 };
        }

        acc[monthYear][cropName].price += numericalPrice;
        acc[monthYear][cropName].count += 1;

        return acc;
    }, {});

    return Object.entries(monthCropTotals).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, price, count }]) => ({
            monthYear: month,
            cropName,
            season,
            price: parseFloat((price / count).toFixed(2))
        }))
    );
}


function countPestOccurrence(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropCounts = data.reduce((acc, item) => {
        const { monthYear, cropName, season } = item;

        if (!acc[monthYear]) {
            acc[monthYear] = {};
        }

        if (!acc[monthYear][cropName]) {
            acc[monthYear][cropName] = { season, pestOccurrence: 0 };
        }

        acc[monthYear][cropName].pestOccurrence++;
        return acc;
    }, {});

    return Object.entries(monthCropCounts).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, pestOccurrence }]) => ({
            monthYear: month,
            cropName,
            season,
            pestOccurrence
        }))
    );
}

function countPestOccurrenceBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const barangayCropCounts = data.reduce((acc, item) => {
        const { barangay, cropName } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = 0;
        }

        acc[barangay][cropName]++;
        return acc;
    }, {});

    return Object.entries(barangayCropCounts).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, count]) => ({
            barangay,
            cropName,
            pestOccurrence: count
        }))
    );
}

function countDiseaseOccurrenceBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const barangayCropCounts = data.reduce((acc, item) => {
        const { barangay, cropName } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = 0;
        }

        acc[barangay][cropName]++;
        return acc;
    }, {});

    return Object.entries(barangayCropCounts).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, count]) => ({
            barangay,
            cropName,
            diseaseOccurrence: count
        }))
    );
}

function countDiseaseOccurrence(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const barangayMonthCropCounts = data.reduce((acc, item) => {
        const { barangay, monthYear, cropName, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][monthYear]) {
            acc[barangay][monthYear] = {};
        }

        if (!acc[barangay][monthYear][cropName]) {
            acc[barangay][monthYear][cropName] = { season, diseaseOccurrence: 0 };
        }

        acc[barangay][monthYear][cropName].diseaseOccurrence++;
        return acc;
    }, {});

    return Object.entries(barangayMonthCropCounts).flatMap(([barangay, monthCropCounts]) =>
        Object.entries(monthCropCounts).flatMap(([month, crops]) =>
            Object.entries(crops).map(([cropName, { season, diseaseOccurrence }]) => ({
                barangay,
                monthYear: month,
                cropName,
                season,
                diseaseOccurrence
            }))
        )
    );
}

function priceIncomePerHectare(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropTotals = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, volumeSold, areaPlanted, price } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalIncome: 0, totalArea: 0 };
        }

        let calculatedPrice = price;

        // Apply specific conversion logic for Upo or any other crop
        if (cropName.toLowerCase() === 'upo') {
            calculatedPrice = price * 3; // Example for Upo
        } else if (cropName.toLowerCase().includes('kg')) {
            calculatedPrice = price / 1000; // Example for crops measured in kg
        }

        acc[monthPlanted][cropName].totalIncome += volumeSold * calculatedPrice;
        acc[monthPlanted][cropName].totalArea += areaPlanted;

        return acc;
    }, {});

    return Object.entries(monthCropTotals).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalIncome, totalArea }]) => ({
            monthYear: month,
            cropName,
            season,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            incomePerHectare: parseFloat((totalIncome / totalArea).toFixed(2))
        }))
    );
}

function priceIncomePerHectareBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const barangayCropTotals = data.reduce((acc, item) => {
        const { barangay, cropName, volumeSold, areaPlanted, price } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { totalIncome: 0, totalArea: 0 };
        }

        let calculatedPrice = price;

        // Apply specific conversion logic for Upo or any other crop
        if (cropName.toLowerCase() === 'upo') {
            calculatedPrice = price * 3; // Example for Upo
        } else if (cropName.toLowerCase().includes('kg')) {
            calculatedPrice = price / 1000; // Example for crops measured in kg
        }

        acc[barangay][cropName].totalIncome += volumeSold * calculatedPrice;
        acc[barangay][cropName].totalArea += areaPlanted;

        return acc;
    }, {});

    return Object.entries(barangayCropTotals).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { totalIncome, totalArea }]) => ({
            barangay,
            cropName,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            incomePerHectare: totalArea > 0 ? parseFloat((totalIncome / totalArea).toFixed(2)) : 0
        }))
    );
}

function benefitPerHectare(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropTotals = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, volumeSold, areaPlanted, price, productionCost } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalIncome: 0, totalArea: 0, totalProductionCost: 0 };
        }

        let calculatedPrice = price;

        // Apply specific conversion logic for Upo or any other crop
        if (cropName.toLowerCase() === 'upo') {
            calculatedPrice = price * 3; // Example for Upo
        } else if (cropName.toLowerCase().includes('kg')) {
            calculatedPrice = price / 1000; // Example for crops measured in kg
        }

        acc[monthPlanted][cropName].totalIncome += volumeSold * calculatedPrice;
        acc[monthPlanted][cropName].totalArea += areaPlanted;
        acc[monthPlanted][cropName].totalProductionCost += productionCost;

        return acc;
    }, {});

    return Object.entries(monthCropTotals).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalIncome, totalArea, totalProductionCost }]) => ({
            monthYear: month,
            cropName,
            season,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            totalProductionCost: parseFloat(totalProductionCost.toFixed(2)),
            benefitPerHectare: parseFloat(((totalIncome / totalArea) - (totalProductionCost / totalArea)).toFixed(2))
        }))
    );
}

function benefitPerHectareBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const barangayCropTotals = data.reduce((acc, item) => {
        const { barangay, cropName, volumeSold, areaPlanted, price, productionCost } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { totalIncome: 0, totalArea: 0, totalProductionCost: 0 };
        }

        let calculatedPrice = price;

        // Apply specific conversion logic for Upo or any other crop
        if (cropName.toLowerCase() === 'upo') {
            calculatedPrice = price * 3; // Example for Upo
        } else if (cropName.toLowerCase().includes('kg')) {
            calculatedPrice = price / 1000; // Example for crops measured in kg
        }

        acc[barangay][cropName].totalIncome += volumeSold * calculatedPrice;
        acc[barangay][cropName].totalArea += areaPlanted;
        acc[barangay][cropName].totalProductionCost += productionCost;

        return acc;
    }, {});

    return Object.entries(barangayCropTotals).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { totalIncome, totalArea, totalProductionCost }]) => ({
            barangay,
            cropName,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            totalProductionCost: parseFloat(totalProductionCost.toFixed(2)),
            benefitPerHectare: totalArea > 0 
                ? parseFloat(((totalIncome - totalProductionCost) / totalArea).toFixed(2)) 
                : 0
        }))
    );
}


function getCropData(production, price, pest, disease, crops, type) {
    if (!Array.isArray(production) || !Array.isArray(price) || !Array.isArray(pest) || !Array.isArray(disease)) {
        console.error('Expected all inputs to be arrays');
        return [];
    }

    // Create a map to associate crop names with their types
    const cropTypeMap = crops.reduce((map, crop) => {
        map[crop.cropName] = crop.type;
        return map;
    }, {});

    // Filter production data based on the specified type
    const filteredProduction = production.filter(item => cropTypeMap[item.cropName] === type);

    // Extract related data from other datasets
    const totalPlantedData = countTotalPlanted(filteredProduction);
    const averageVolumeData = averageVolumeProduction(filteredProduction);
    const averagePriceData = averagePrice(price);
    const pestOccurrenceData = countPestOccurrence(pest);
    const diseaseOccurrenceData = countDiseaseOccurrence(disease);
    const priceIncomeData = priceIncomePerHectare(filteredProduction);
    const benefitData = benefitPerHectare(filteredProduction);

    return filteredProduction.map(prodItem => {
        const { cropName, variety, season, monthYear, volumeProduction } = prodItem;

        // Find related data from other datasets
        const plantedData = totalPlantedData.find(item => item.cropName === cropName && item.monthYear === monthYear) || {};
        const priceData = averagePriceData.find(item => item.cropName === cropName && item.monthYear === monthYear) || {};
        const pestData = pestOccurrenceData.find(item => item.cropName === cropName && item.monthYear === monthYear) || {};
        const diseaseData = diseaseOccurrenceData.find(item => item.cropName === cropName && item.monthYear === monthYear) || {};
        const incomeData = priceIncomeData.find(item => item.cropName === cropName && item.monthYear === monthYear) || {};
        const benefitDataItem = benefitData.find(item => item.cropName === cropName && item.monthYear === monthYear) || {};

        return {
            cropName,
            variety: variety || '',
            totalPlanted: plantedData.totalPlanted || 0,          
            volumeProductionPerHectare: volumeProduction,
            price: priceData.price || 0,
            pestOccurrence: pestData.pestOccurrence || 0,
            diseaseOccurrence: diseaseData.diseaseOccurrence || 0,
            incomePerHectare: incomeData.incomePerHectare || 0,
            benefitPerHectare: benefitDataItem.benefitPerHectare || 0,
            season,
            monthYear
        };
    });
}
