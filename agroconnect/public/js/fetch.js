
async function getCrop(type = '') {
    try {
        const response = await $.ajax({
            url: 'api/crops', // Adjust if needed
            type: 'GET',
            dataType: 'json'
        });
        return response.filter(crop => !type || crop.type.toLowerCase() === type.toLowerCase());
    } catch (error) {
        console.error('An error occurred while fetching the crop data:', error);
        throw error;
    }
}

function getProductions() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'api/productions', // Adjust URL as necessary
            method: 'GET',
            dataType: 'json',
            success: function(data) {
            
                                                       resolve(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Failed to fetch production data:', textStatus, errorThrown);
                reject([]);
            }
        });
    });
}


async function getBarangay() {
    try {
        const response = await $.ajax({
            url: 'api/barangays', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getFarmer() {
    try {
        const response = await $.ajax({
            url: 'api/farmers', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getRecord() {
    try {
        const response = await $.ajax({
            url: 'api/records', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getSoilHealth() {
    try {
        const response = await $.ajax({
            url: 'api/soilhealths', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getUsers() {
    try {
        const response = await $.ajax({
            url: 'api/users', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getConcerns() {
    try {
        const response = await $.ajax({
            url: 'api/concerns', // Replace with your API endpoint
            type: 'GET',
            dataType: 'json'
        });
        return response;
    } catch (error) {
        console.error('An error occurred while fetching barangay data:', error);
        throw error;
    }
}

async function getDataEntries() {
    try {
        // Fetch data asynchronously
        let [production, price, pest, disease, soilHealth] = await Promise.all([
            getProductions(),
            getPrice(),
            getPest(), 
            getDisease(),
            getSoilHealth()
        ]);

        // Calculate the sum of lengths of all data entries
        let totalLength = production.length + price.length + pest.length + disease.length + soilHealth.length;

        return totalLength;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}


async function getProduction(cropName = '', season) {
    try {
        const response = await $.ajax({
            url: 'api/productions', // Update this path to the location of your production.json
            type: 'GET',
            dataType: 'json'
        });
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            item.season.toLowerCase() === lowerCaseSeason
        );
    } catch (error) {
        console.error('An error occurred while fetching the production data:', error);
        throw error;
    }
}

async function getPrice(cropName = '', season = '') {
    try {
        const response = await $.ajax({
            url: 'api/prices', // Update this path to the location of your price.json
            type: 'GET',
            dataType: 'json'
        });
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            (lowerCaseSeason === '' || item.season.toLowerCase() === lowerCaseSeason)
        );
    } catch (error) {
        console.error('An error occurred while fetching the price data:', error);
        throw error;
    }
}

async function getPest(cropName = '', season = '') {
    try {
        const response = await $.ajax({
            url: 'api/pests', // Update this path to the location of your pest.json
            type: 'GET',
            dataType: 'json'
        });
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            (lowerCaseSeason === '' || item.season.toLowerCase() === lowerCaseSeason)
        );
    } catch (error) {
        console.error('An error occurred while fetching the pest data:', error);
        throw error;
    }
}

async function getDisease(cropName = '', season) {
    try {
        const response = await $.ajax({
            url: 'api/diseases', // Update this path to the location of your disease.json
            type: 'GET',
            dataType: 'json'
        });
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            (lowerCaseSeason === '' || item.season.toLowerCase() === lowerCaseSeason)
        );
    } catch (error) {
        console.error('An error occurred while fetching the disease data:', error);
        throw error;
    }
}

export { getCrop, getBarangay, getProduction, getProductions, getPrice, getPest, getDisease, getFarmer, getDataEntries, getRecord, getUsers, getConcerns };
