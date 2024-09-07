// Helper function to parse date
function parseDate(dateString) {
    return new Date(dateString).getFullYear();
}

function calculateYearlyAverages(yearlyData) {
    return Object.keys(yearlyData).map(year => {
        const sum = yearlyData[year].reduce((a, b) => a + b, 0);
        return sum / yearlyData[year].length;
    });
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

function calculateZScoresForGrowthRates(yearlyAverages, growthRates) {
    const mean = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    
    const stdDev = Math.sqrt(growthRates.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / growthRates.length);
    const zScores = growthRates.map(rate => (rate - mean) / stdDev);
    const meanZScore = zScores.reduce((a, b) => a + b, 0) / zScores.length;
    
    return { growthRateZScores: zScores, meanGrowthRateZScore: meanZScore };
}

// Interpret performance
function interpretPerformance(zScore) {
    
    if (zScore > 2) return 'Excellent';
    if (zScore > 1) return 'Good';
    if (zScore > 0) return 'Average';
    if (zScore > -1) return 'Below Average';
    return 'Poor';
}

function interpretPerformanceScore(growthRate) {
    // Define a scoring system based on growth rate percentage
    let score = 0;

    if (growthRate >= 30) {
        score = 100; // Excellent
    } else if (growthRate >= 10) {
        score = 80; // Good
    } else if (growthRate >= 0) {
        score = 60; // Average
    } else if (growthRate >= -20) {
        score = 40; // Below Average
    } else {
        score = 20; // Poor
    }

    return score;
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


   // Function to extract numeric value from price string
   function parsePrice(priceString) {
    // Regular expressions for different formats
    const matchPiece = priceString.match(/^(\d+(\.\d+)?)\/pc$/); // Matches price/pc
    const matchBundle = priceString.match(/^(\d+(\.\d+)?)\/bundle$/); // Matches price/bundle

    // Check if priceString is a range (e.g., "10-15")
    if (typeof priceString === 'string' && priceString.includes('-')) {
        const [min, max] = priceString.split('-').map(parseFloat);
        return (min + max) / 2; // Return the average of the range
    }

    // Extract price based on format
    if (matchPiece) {
        // Extract price per piece and convert to price per kilogram
        const pricePerPiece = parseFloat(matchPiece[1]);
        const weightPerPiece = 0.2; // Define this based on your needs
        console.log(pricePerPiece);
        console.log(pricePerPiece / weightPerPiece);
        return pricePerPiece / weightPerPiece;
    } else if (matchBundle) {
        // Extract price per bundle and convert to price per kilogram
        const pricePerBundle = parseFloat(matchBundle[1]);
        const weightPerBundle = 1; // Define this based on your needs
        return pricePerBundle / weightPerBundle;
    } else {
        // If the price string is numeric or a range without a unit, assume it is per kilogram
        return parseFloat(priceString);
    }
}

function countAverageAreaPlanted(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    console.log(data);

    // Aggregate data
    const monthCropCounts = data.reduce((acc, item) => {
        const { monthPlanted, cropName, season, areaPlanted } = item;

        if (!acc[monthPlanted]) {
            acc[monthPlanted] = {};
        }

        if (!acc[monthPlanted][cropName]) {
            acc[monthPlanted][cropName] = { season, totalPlanted: 0, areaPlanted: 0 };
        }

        acc[monthPlanted][cropName].totalPlanted++;
        acc[monthPlanted][cropName].areaPlanted += areaPlanted;
        
        return acc;
    }, {});

    // Calculate averageAreaPlanted and prepare final output
    return Object.entries(monthCropCounts).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalPlanted, areaPlanted }]) => ({
            monthYear: month,
            cropName,
            season,
            totalPlanted,
            areaPlanted: parseFloat((areaPlanted / totalPlanted).toFixed(2)) // Compute averageAreaPlanted as totalArea / totalPlanted
        }))
    );
}

function countAverageAreaPlantedBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const barangayCropCounts = data.reduce((acc, item) => {
        const { barangay, cropName, season, areaPlanted } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { season, totalPlanted: 0, areaPlanted: 0 };
        }

        acc[barangay][cropName].totalPlanted++;
        acc[barangay][cropName].areaPlanted += areaPlanted;
        return acc;
    }, {});

    return Object.entries(barangayCropCounts).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalPlanted, areaPlanted }]) => ({
            barangay,
            cropName,
            season,
            totalPlanted,
            areaPlanted: parseFloat((areaPlanted / totalPlanted).toFixed(2)) // Compute averageAreaPlanted as totalArea / totalPlanted
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

    // Aggregate total volume, area, count records, and track season per barangay and crop
    const barangayCropTotals = data.reduce((acc, item) => {
        const { barangay, cropName, volumeProduction, areaPlanted, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { totalVolume: 0, totalArea: 0, count: 0, season: '' };
        }

        acc[barangay][cropName].totalVolume += volumeProduction;
        acc[barangay][cropName].totalArea += areaPlanted;
        acc[barangay][cropName].count++;

        // Assume the season is consistent across records for the same barangay and crop
        acc[barangay][cropName].season = season;

        return acc;
    }, {});

    // Transform aggregated data into the desired format
    return Object.entries(barangayCropTotals).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalVolume, totalArea, count }]) => ({
            barangay,
            cropName,
            season,
            totalVolume: totalVolume.toFixed(2),
            totalArea: totalArea.toFixed(2),
            volumeProduction: totalArea > 0 
                ? parseFloat((totalVolume / totalArea).toFixed(2)) 
                : 0,
        }))
    );
}


function averagePrice(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const monthCropTotals = data.reduce((acc, item) => {
        const { monthYear, cropName, season, price } = item;
        let numericalPrice = 0;

        numericalPrice = parsePrice(price);

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

    // Aggregate pest occurrences per barangay, crop, and season
    const barangayCropCounts = data.reduce((acc, item) => {
        const { barangay, cropName, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = {};
        }

        if (!acc[barangay][cropName][season]) {
            acc[barangay][cropName][season] = 0;
        }

        acc[barangay][cropName][season]++;
        return acc;
    }, {});

    // Transform aggregated data into the desired format
    return Object.entries(barangayCropCounts).flatMap(([barangay, crops]) =>
        Object.entries(crops).flatMap(([cropName, seasons]) =>
            Object.entries(seasons).map(([season, count]) => ({
                barangay,
                cropName,
                season,
                pestOccurrence: count
            }))
        )
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

function countDiseaseOccurrenceBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    // Aggregate disease occurrences per barangay, crop, and season
    const barangayCropCounts = data.reduce((acc, item) => {
        const { barangay, cropName, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = {};
        }

        if (!acc[barangay][cropName][season]) {
            acc[barangay][cropName][season] = 0;
        }

        acc[barangay][cropName][season]++;
        return acc;
    }, {});

    // Transform aggregated data into the desired format
    return Object.entries(barangayCropCounts).flatMap(([barangay, crops]) =>
        Object.entries(crops).flatMap(([cropName, seasons]) =>
            Object.entries(seasons).map(([season, count]) => ({
                barangay,
                cropName,
                season,
                diseaseOccurrence: count
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

        let calculatedPrice = parsePrice(price);
        let calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms
        

        acc[monthPlanted][cropName].totalIncome += calculatedVolume * calculatedPrice;
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
            incomePerHectare: totalArea > 0 ? parseFloat((totalIncome / totalArea).toFixed(2)) : 0 // Avoid division by zero
        }))
    );
}

function priceIncomePerHectareBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }


    const barangayCropTotals = data.reduce((acc, item) => {
        const { barangay, cropName, volumeSold, areaPlanted, price, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { totalIncome: 0, totalArea: 0, season: '' };
        }

        let calculatedPrice = parsePrice(price);
        let calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms

        acc[barangay][cropName].totalIncome += calculatedVolume * calculatedPrice;
        acc[barangay][cropName].totalArea += areaPlanted;

        // Store the season, assuming it's consistent for each barangay-crop pair
        acc[barangay][cropName].season = season;

        return acc;
    }, {});

    return Object.entries(barangayCropTotals).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalIncome, totalArea }]) => ({
            barangay,
            cropName,
            season,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            incomePerHectare: totalArea > 0 ? parseFloat((totalIncome / totalArea).toFixed(2)) : 0
        }))
    );
}


function profitPerHectare(data) {
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
            acc[monthPlanted][cropName] = { season, totalIncome: 0, totalArea: 0, totalProductionCost: 0, count: 0  };
        }

        let calculatedPrice = parsePrice(price);
        let calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms

        acc[monthPlanted][cropName].totalIncome += calculatedVolume * calculatedPrice;
        acc[monthPlanted][cropName].totalArea += areaPlanted;
        acc[monthPlanted][cropName].totalProductionCost += productionCost;
        acc[monthPlanted][cropName].count += 1; 

        return acc;
    }, {});

    

    return Object.entries(monthCropTotals).flatMap(([month, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalIncome, totalArea, totalProductionCost, count }]) => ({

            monthYear: month,
            cropName,
            season,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            totalProductionCost: parseFloat(totalProductionCost.toFixed(2)),
            profitPerHectare: totalArea > 0 ? parseFloat(((totalIncome - totalProductionCost) / totalArea).toFixed(2)) : 0

        }))
    );
}


function profitPerHectareBarangay(data) {
    if (!Array.isArray(data)) {
        console.error('Expected data to be an array');
        return [];
    }

    const barangayCropTotals = data.reduce((acc, item) => {
        const { barangay, cropName, volumeSold, areaPlanted, price, productionCost, season } = item;

        if (!acc[barangay]) {
            acc[barangay] = {};
        }

        if (!acc[barangay][cropName]) {
            acc[barangay][cropName] = { totalIncome: 0, totalArea: 0, totalProductionCost: 0, season: '' };
        }

        let calculatedPrice = parsePrice(price);
        let calculatedVolume = volumeSold * 1000; // Convert metric tons to kilograms


        acc[barangay][cropName].totalIncome += calculatedVolume * calculatedPrice;
        acc[barangay][cropName].totalArea += areaPlanted;
        acc[barangay][cropName].totalProductionCost += productionCost;

        // Store the season, assuming it's consistent for each barangay-crop pair
        acc[barangay][cropName].season = season;

        return acc;
    }, {});

    return Object.entries(barangayCropTotals).flatMap(([barangay, crops]) =>
        Object.entries(crops).map(([cropName, { season, totalIncome, totalArea, totalProductionCost }]) => ({
            barangay,
            cropName,
            season,
            totalIncome: parseFloat(totalIncome.toFixed(2)),
            totalArea: parseFloat(totalArea.toFixed(2)),
            totalProductionCost: parseFloat(totalProductionCost.toFixed(2)),
            profitPerHectare: totalArea > 0 ? parseFloat(((totalIncome - totalProductionCost) / totalArea).toFixed(2)) : 0 
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
    const filteredPrice = price.filter(item => cropTypeMap[item.cropName] === type);
    const filteredPest = pest.filter(item => cropTypeMap[item.cropName] === type);
    const filteredDisease = disease.filter(item => cropTypeMap[item.cropName] === type);

    // Extract related data from other datasets
    const totalPlantedData = countAverageAreaPlanted(filteredProduction);
    const averageVolumeData = averageVolumeProduction(filteredProduction);
    const averagePriceData = averagePrice(filteredPrice);
    const pestOccurrenceData = countPestOccurrence(filteredPest);
    const diseaseOccurrenceData = countDiseaseOccurrence(filteredDisease);
    const priceIncomeData = priceIncomePerHectare(filteredProduction);
    const profitData = profitPerHectare(filteredProduction);

    return filteredProduction.map(prodItem => {
        const { cropName, variety, season, monthYear } = prodItem;

        // Find related data from other datasets, using default values if necessary
        const plantedData = totalPlantedData.find(item => item.cropName === cropName) || {};
        const volumeData = averageVolumeData.find(item => item.cropName === cropName) || {};
        const priceData = averagePriceData.find(item => item.cropName === cropName) || {};
        const pestData = pestOccurrenceData.find(item => item.cropName === cropName) || {};
        const diseaseData = diseaseOccurrenceData.find(item => item.cropName === cropName) || {};
        const incomeData = priceIncomeData.find(item => item.cropName === cropName) || {};
        const profitDataItem = profitData.find(item => item.cropName === cropName) || {};

        return {
            cropName,
            variety: variety || '',
            totalPlanted: plantedData.totalPlanted || 0,
            volumeProductionPerHectare: volumeData.volumeProduction || 0,
            price: priceData.price || 0,
            pestOccurrence: pestData.pestOccurrence || 0,
            diseaseOccurrence: diseaseData.diseaseOccurrence || 0,
            incomePerHectare: incomeData.incomePerHectare || 0,
            profitPerHectare: profitDataItem.profitPerHectare || 0,
            season,
            monthYear
        };
    });
};

export { countAverageAreaPlanted, averageVolumeProduction, averagePrice, countPestOccurrence, countDiseaseOccurrence, priceIncomePerHectare, profitPerHectare, getCropData,
    parseDate, calculateYearlyAverages, calculateZScoresForGrowthRates, interpretPerformance, interpretPerformanceScore,
    countAverageAreaPlantedBarangay, averageVolumeProductionBarangay, countPestOccurrenceBarangay, countDiseaseOccurrenceBarangay, priceIncomePerHectareBarangay, profitPerHectareBarangay
};
