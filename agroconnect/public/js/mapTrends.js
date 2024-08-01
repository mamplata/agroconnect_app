let barangays = [];
let globalMap = null;
let downloadData;
let currentType;

// Fetch initial barangay data
async function initializeBarangays() {
    try {
        barangays = await getBarangay(); // Fetch and initialize barangay data
    } catch (error) {
        console.error('Failed to initialize barangays:', error);
    }
}

// Initialize global map
function initializeGlobalMap() {
    if (!globalMap) {
        globalMap = L.map('map', { renderer: L.canvas() }).setView([14.2700, 121.1260], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(globalMap);

        // Ensure the map is loaded initially
        globalMap.whenReady(() => globalMap.invalidateSize());
    }
}

// Define MapTrends class
class MapTrends {
    constructor(season, type, crop, category) {
        this.season = season;
        this.type = type;
        this.crop = crop;
        this.category = category;
    }

    generateMapTrends(barangays, data, key, label, text) {
        $('title').empty();
        $('#title').html(`<p>${label}</p>`); // Update title
        $('.label-box').empty();

        // Initialize missing barangay data
        barangays.forEach(barangay => {
            if (!data.find(d => d.barangay === barangay.barangay)) {
                data.push({ barangay: barangay.barangay, cropName: this.crop, season: this.season, [key]: 0 });
            }
        });

        // Parse key values to ensure they're numbers
        data.forEach(d => {
            d[key] = parseFloat(d[key]);
        });

        const keyArray = data.map(d => d[key]);
        console.log('Key Array:', keyArray); // Debugging

        const mean = keyArray.reduce((sum, value) => sum + value, 0) / keyArray.length;
        const stdDev = Math.sqrt(keyArray.map(value => Math.pow(value - mean, 2)).reduce((sum, value) => sum + value, 0) / keyArray.length);

        data.forEach(d => {
            d.zScore = (d[key] - mean) / stdDev;
        });

        function getColor(zScore) {
            if (zScore > 1.5) return '#0000FF'; // Blue
            if (zScore >= 0.5) return '#008000'; // Green
            return '#FF0000'; // Red
        }

        return {
            barangays,
            data,
            getColor
        };
    }

    displayMapTrends(barangays, data, key, label, text) {
        let markerLayerGroup = L.layerGroup().addTo(globalMap);

        // Close all open popups before adding new markers
        globalMap.eachLayer(layer => {
            if (layer instanceof L.CircleMarker && layer.isPopupOpen()) {
                layer.closePopup();
            }
        });

        const { barangays: updatedBarangays, data: updatedData, getColor } = this.generateMapTrends(barangays, data, key, label, text);

        setTimeout(() => {
            markerLayerGroup.clearLayers();

            updatedBarangays.forEach(barangay => {
                const { lat, lon } = getLatLon(barangay.coordinate);
                const locationData = updatedData.find(d => d.barangay === barangay.barangay);
                if (locationData) {
                    const color = getColor(locationData.zScore);

                    var circleMarker = L.circleMarker([lat, lon], {
                        radius: 8,
                        color: 'black',
                        fillColor: color,
                        fillOpacity: 1
                    }).bindPopup(`<strong>${barangay.barangay}:</strong><br>${text}: ${locationData[key]}`)
                      .on('popupopen', function () {
                          globalMap.panTo(circleMarker.getLatLng());
                      });

                    markerLayerGroup.addLayer(circleMarker);
                }
            });

            interpret(updatedData, key, text);
        }, 500); // Delay of 500 milliseconds
    }
}

// Interpret data and update interpretation section
function interpret(data, key, text) {
    const sortedData = [...data].sort((a, b) => b[key] - a[key]);
    const highestValue = sortedData[0][key];
    const lowestValue = sortedData[sortedData.length - 1][key];

    const highestBarangays = sortedData.filter(d => d[key] === highestValue).map(d => d.barangay);
    const lowestBarangays = sortedData.filter(d => d[key] === lowestValue).map(d => d.barangay);

    $('#interpretation').html(`
        <p>Findings: The barangays with the highest ${text} (${highestValue}) are: ${highestBarangays.join(', ')} (${highestBarangays.length} barangay${highestBarangays.length > 1 ? 's' : ''}). The barangays with the lowest ${text} (${lowestValue}) are: ${lowestBarangays.join(', ')} (${lowestBarangays.length} barangay${lowestBarangays.length > 1 ? 's' : ''}).</p>
    `);
}

// Update crop options based on type
async function updateCropOptions() {
    const type = $('#type').val().toLowerCase();
    let options = '';

    try {
        const crops = await getCrop(type);
        options = crops.length > 0
            ? crops.map(crop => `<option value="${crop.cropName.toLowerCase()}">${crop.cropName}</option>`).join('')
            : '<option value="">No crops available</option>';
    } catch (error) {
        console.error('Failed to update crop options:', error);
        options = '<option value="">Error loading crops</option>';
    }

    $('#crop').html(options);
}

// Handle category change and display results
async function handleCategoryChange() {
    const season = $('#season').val();
    const type = $('#type').val();
    const crop = $('#crop').val();
    const category = $('#category').val();

    let categoryText, dataset = [], data = [], key, yearRange, text;

    switch (category) {
        case 'total_planted':
            key = "totalPlanted";
            data = await getProduction(crop, season);
            yearRange = getYearRange(data);
            categoryText = `Total Planted Per Barangay (${yearRange})`;
            dataset = countTotalPlantedBarangay(data);
            text = "total planted";
            break;
        case 'production_volume':
            key = "volumeProduction";
            data = await getProduction(crop, season);
            yearRange = getYearRange(data);
            categoryText = `Production Volume Per Barangay (${yearRange})`;
            dataset = averageVolumeProductionBarangay(data);
            text = "production volume per hectare";
            break;
        case 'pest_occurrence':
            key = "pestOccurrence";
            data = await getPest(crop, season);
            yearRange = getYearRange(data);
            categoryText = `Pest Occurrence Per Barangay (${yearRange})`;
            dataset = countPestOccurrenceBarangay(data);
            text = "pest occurrence";
            break;
        case 'disease_occurrence':
            key = "diseaseOccurrence";
            data = await getDisease(crop, season);
            yearRange = getYearRange(data);
            categoryText = `Disease Occurrence Per Barangay (${yearRange})`;
            dataset = countDiseaseOccurrenceBarangay(data);
            text = "disease occurrence";
            break;
        case 'price_income_per_hectare':
            key = "incomePerHectare";
            data = await getProduction(crop, season);
            yearRange = getYearRange(data);
            categoryText = `Price Income per Hectare Per Barangay (${yearRange})`;
            dataset = priceIncomePerHectareBarangay(data);
            text = "price income per hectare";
            break;
        case 'benefit_per_hectare':
            key = "benefitPerHectare";
            data = await getProduction(crop, season);
            yearRange = getYearRange(data);
            categoryText = `Benefit per Hectare Per Barangay (${yearRange})`;
            dataset = benefitPerHectareBarangay(data);
            text = "benefit per hectare";
            break;
        default:
            categoryText = 'Category not recognized';
    }

    if (dataset.length !== 0 && crop !== null) {
        const mt = new MapTrends(season, type, crop, categoryText);
        mt.displayMapTrends(barangays, dataset, key, categoryText, text);
        currentType = key;
        downloadData = dataset;
    } else {
       console.log('none');
    }
}

// Initialize with default crop options and attach event listeners
$(document).ready(function () {
    initializeBarangays();
    updateCropOptions();
    handleCategoryChange();

    $('#type').on('change', updateCropOptions);
    $('#type, #category, #crop, #season').on('change', handleCategoryChange);

    $('.download-btn').click(function() {
        $('#downloadModal').modal('show');
    });

    $('.download-option').click(function() {
        const format = $(this).data('format');
        download(format, currentType, downloadData);
    });
});

// Parse latitude and longitude from coordinate string
function getLatLon(coordinate) {
    const [lat, lon] = coordinate.split(',').map(parseFloat);
    return { lat, lon };
}
