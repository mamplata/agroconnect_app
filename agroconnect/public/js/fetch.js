async function getCrop(type = '') {
    try {
        const response = await $.ajax({
            url: 'api/crops', // Adjust if needed
            type: 'GET',
            dataType: 'json'
        });
        console.log(response);
        // Filter data based on type if provided
        return response.filter(crop => !type || crop.type.toLowerCase() === type.toLowerCase());
    } catch (error) {
        console.error('An error occurred while fetching the crop data:', error);
        throw error; // Re-throw the error if you want to handle it outside
    }
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
        throw error; // Re-throw the error if you want to handle it outside
    }
}


async function getProduction(cropName = '', season) {
    try {
        const response = await $.ajax({
            url: 'api/productions', // Update this path to the location of your production.json
            type: 'GET',
            dataType: 'json'
        });

        // Convert cropName and season to lowercase for case-insensitive comparison, if defined
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';

        // Filter the data based on cropName and season (case-insensitive)
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            item.season.toLowerCase() === lowerCaseSeason
        );
    } catch (error) {
        console.error('An error occurred while fetching the production data:', error);
        throw error; // Re-throw the error if you want to handle it outside
    }
}

async function getPrice(cropName = '', season) {
    try {
        const response = await $.ajax({
            url: 'api/prices', // Update this path to the location of your price.json
            type: 'GET',
            dataType: 'json'
        });

        // Convert cropName and season to lowercase for case-insensitive comparison, if defined
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';

        // Filter the data based on cropName and season (case-insensitive)
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            item.season.toLowerCase() === lowerCaseSeason
        );
    } catch (error) {
        console.error('An error occurred while fetching the price data:', error);
        throw error; // Re-throw the error if you want to handle it outside
    }
}

async function getPest(cropName = '', season) {
    try {
        const response = await $.ajax({
            url: 'api/pests', // Update this path to the location of your pest.json
            type: 'GET',
            dataType: 'json'
        });

        // Convert cropName and season to lowercase for case-insensitive comparison, if defined
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';

        // Filter the data based on cropName and season (case-insensitive)
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            item.season.toLowerCase() === lowerCaseSeason
        );
    } catch (error) {
        console.error('An error occurred while fetching the pest data:', error);
        throw error; // Re-throw the error if you want to handle it outside
    }
}

async function getDisease(cropName = '', season) {
    try {
        const response = await $.ajax({
            url: 'api/diseases', // Update this path to the location of your disease.json
            type: 'GET',
            dataType: 'json'
        });

        // Convert cropName and season to lowercase for case-insensitive comparison, if defined
        const lowerCaseCropName = cropName ? cropName.toLowerCase() : '';
        const lowerCaseSeason = season ? season.toLowerCase() : '';

        // Filter the data based on cropName and season (case-insensitive)
        return response.filter(item => 
            (lowerCaseCropName === '' || item.cropName.toLowerCase() === lowerCaseCropName) &&
            item.season.toLowerCase() === lowerCaseSeason
        );
    } catch (error) {
        console.error('An error occurred while fetching the disease data:', error);
        throw error; // Re-throw the error if you want to handle it outside
    }
}
