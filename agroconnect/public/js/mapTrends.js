import { getCrop, getProduction, getPest, getDisease, getProductions, getBarangay, getYearRange} from './fetch.js';
import * as stats from './statistics.js';

let barangays = [];
let globalMap = null;
let downloadData;
let currentType;

// Fetch initial barangay data
async function initializeBarangays() {
    try {
        barangays = await getBarangay();
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
        this.season = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
        this.type = type;
        this.crop = crop;
        this.category = category;
    }

    generateMapTrends(barangays, data, key, label) {
        $('title').empty();
        $('#title').html(`<p>${label}</p>`); // Update title
        $('.label-box').empty();

        // Initialize missing barangay data
        barangays.forEach(barangay => {
            if (!data.find(d => d.barangayName === barangay.barangayName)) {
                data.push({ barangay: barangay.barangayName, cropName: this.crop, season: this.season, [key]: 0 });
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

        const { barangays: updatedBarangays, data: updatedData, getColor } = this.generateMapTrends(barangays, data, key, label);

        setTimeout(() => {
            markerLayerGroup.clearLayers();

            updatedBarangays.forEach(barangay => {
                const { lat, lon } = getLatLon(barangay.coordinates);
                const locationData = updatedData.find(d => d.barangay === barangay.barangayName);
                if (locationData) {
                    const color = getColor(locationData.zScore);

                    var circleMarker = L.circleMarker([lat, lon], {
                        radius: 8,
                        color: 'black',
                        fillColor: color,
                        fillOpacity: 1
                    }).bindPopup(`<strong>${barangay.barangayName}:</strong><br>${text}: ${locationData[key]}`)
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
  
  // Filter barangays for highest and lowest values separately
  const highestBarangays = sortedData
      .filter(d => d[key] === highestValue)
      .map(d => d.barangay);
  const lowestBarangays = sortedData
      .filter(d => d[key] === lowestValue)
      .map(d => d.barangay)
      .filter(barangay => !highestBarangays.includes(barangay)); // Exclude highest barangays

  $('#interpretation').html(`
      <p>Findings: The barangays with the highest ${text} (${highestValue}) are: ${highestBarangays.join(', ')} (${highestBarangays.length} barangay${highestBarangays.length > 1 ? 's' : ''}). The barangays with the lowest ${text} (${lowestValue}) are: ${lowestBarangays.join(', ')} (${lowestBarangays.length} barangay${lowestBarangays.length > 1 ? 's' : ''}).</p>
  `);
}

async function getUniqueCropNames() {
  let season = $('#season').val();
  try {
      // Fetch production data
      const productions = await getProductions();
      
      // Filter productions based on the specified season
      const filteredProductions = productions.filter(p => p.season.toLowerCase() === season.toLowerCase());
      
      // Extract unique crop names from the filtered data
      const uniqueCropNames = [...new Set(filteredProductions.map(p => p.cropName.toLowerCase()))];
      
      return uniqueCropNames;
  } catch (error) {
      console.error('Failed to fetch production data:', error);
      return [];
  }
}


async function updateCropOptions() {
  const type = $('#type').val().toLowerCase();
  let options = '';

  try {
      const crops = await getCrop(type);
      const uniqueCropNames = await getUniqueCropNames();

      if (crops.length > 0) {
          const filteredCrops = crops.filter(crop => uniqueCropNames.includes(crop.cropName.toLowerCase()));
          options = filteredCrops.length > 0 
              ? filteredCrops.map(crop => `<option value="${crop.cropName.toLowerCase()}">${crop.cropName}</option>`).join('')
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

// Handle category change and display results
async function handleCategoryChange() {
    const season = $('#season').val();
    const type = $('#type').val();
    const crop = $('#crop').val();
    const category = $('#category').val();

    let categoryText, dataset = [], data = [], key, yearRange, text;
    yearRange = await getYearRange();
    switch (category) {
        case 'total_planted':
            key = "totalPlanted";
            data = await getProduction(crop, season);  
            console.log(data);     
            categoryText = `Total Planted Per Barangay (${yearRange})`;
            dataset = stats.countTotalPlantedBarangay(data);
            text = "total planted";
            break;
        case 'production_volume':
            key = "volumeProduction";
            data = await getProduction(crop, season);
            categoryText = `Production Volume Per Barangay (${yearRange})`;
            dataset = stats.averageVolumeProductionBarangay(data);
            text = "production volume per hectare";
            break;
        case 'pest_occurrence':
            key = "pestOccurrence";
            data = await getPest(crop, season);
            categoryText = `Pest Occurrence Per Barangay (${yearRange})`;
            dataset = stats.countPestOccurrenceBarangay(data);
            text = "pest occurrence";
            break;
        case 'disease_occurrence':
            key = "diseaseOccurrence";
            data = await getDisease(crop, season);
            categoryText = `Disease Occurrence Per Barangay (${yearRange})`;
            dataset = stats.countDiseaseOccurrenceBarangay(data);
            text = "disease occurrence";
            break;
        case 'price_income_per_hectare':
            key = "incomePerHectare";
            data = await getProduction(crop, season);
            categoryText = `Price Income per Hectare Per Barangay (${yearRange})`;
            dataset = stats.priceIncomePerHectareBarangay(data);
            text = "price income per hectare";
            break;
        case 'benefit_per_hectare':
            key = "benefitPerHectare";
            data = await getProduction(crop, season);
            categoryText = `Benefit per Hectare Per Barangay (${yearRange})`;
            dataset = stats.benefitPerHectareBarangay(data);
            text = "benefit per hectare";
            break;
        default:
            categoryText = 'Category not recognized';
    }

    console.log(dataset);
    if (dataset.length !== 0 && crop !== null) {
        $('#unavailable').hide();
        $('.available').show();
        const mt = new MapTrends(season, type, crop, categoryText);
        mt.displayMapTrends(barangays, dataset, key, categoryText, text);
        currentType = key;
        downloadData = dataset;
    } else {
        $('.available').hide();
        $('#unavailable').show();
    }
}

// Initialize with default crop options and attach event listeners
$(document).ready(async function () {
    await initializeGlobalMap();
    await initializeBarangays();
    await updateCropOptions();
    await handleCategoryChange();

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

// Function to determine the rate based on zScore
function getRate(zScore) {
  if (zScore > 1.5) return 'High'; 
  if (zScore >= 0.5) return 'Moderate'; 
  return 'Low'; 
}

async function download(format, type, data) {
    const filename = `${type.toLowerCase()}.${format}`;
    // Extract barangay and rate
    let pdfData = data.map(item => ({
      barangay: item.barangay,
      rate: getRate(item.zScore)
    }));

    if (format === 'csv') {
      downloadCSV(filename, data);
    } else if (format === 'xlsx') {
      downloadExcel(filename, data);
    } else if (format === 'pdf') {
      globalMap.whenReady(() => {
  // Set the view of the map
  globalMap.setView([14.2700, 121.1260], 11);
  
  // Close all open popups
  globalMap.eachLayer(layer => {
    if (layer instanceof L.CircleMarker && layer.isPopupOpen()) {
      layer.closePopup();
    }
  });

  // Delay to ensure all popups are closed before starting the download
  setTimeout(() => {
    downloadPDF(filename, pdfData);
  }, 1000); // Adjust the delay as needed
});

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
    // Filter out 'remarks' key from each row
    const filteredData = data.map(row => {
        const { remarks, ...rest } = row;
        return rest;
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
  const pdf = new jsPDF();
  const margin = 10; // Margin from the page edges
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = margin + 20;

  // Helper function to capture a section as an image
  function captureSection(selector) {
    return html2canvas(document.querySelector(selector), {
      background: 'transparent',
      useCORS: true,
      scale: 2 // Increase scale for better image quality
    }).then(canvas => canvas.toDataURL('image/png'));
  }

  // Helper function to add an image to the PDF
  function addImageToPDF(imgData, x, y, width, height) {
    pdf.addImage(imgData, 'PNG', x, y, width, height, undefined, 'NONE'); // 'NONE' for no compression
  }

  // Function to add the title text to the PDF
  function addTitle() {
    const titleText = document.querySelector('#title').innerText;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(titleText, pageWidth / 2, margin + 12, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
  }

  // Function to add the legend card to the PDF
  function addLegendCard() {
    return captureSection('.legend-card').then(imgData => {
      const scaledWidth = 180 / 3; // Scaled down width
      const scaledHeight = 40 / 3; // Scaled down height
      const legendX = (pageWidth - scaledWidth) / 2; // Center horizontally
      addImageToPDF(imgData, legendX, currentY, scaledWidth, scaledHeight);
      currentY += scaledHeight + 10; // Update Y position for the next section
    });
  }

  // Function to add the map image to the PDF
  function addMap() {
    return captureSection('#map').then(imgData => {
      const imgWidth = 180;
      const imgHeight = 130;
      const mapX = (pageWidth - imgWidth) / 2; // Center horizontally
      addImageToPDF(imgData, mapX, currentY, imgWidth, imgHeight);
      currentY += imgHeight + 10; // Update Y position for the next section
    });
  }

  // Function to add the interpretation text to the PDF
  function addInterpretationText() {
    const interpretationText = document.querySelector('#interpretation').innerText.trim();
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const textWidth = pageWidth - 2 * margin;
    const splitText = pdf.splitTextToSize(interpretationText, textWidth);

    splitText.forEach(line => {
      const lineWidth = pdf.getTextWidth(line);
      const textX = (pageWidth - lineWidth) / 2; // Center horizontally
      if (currentY > pageHeight - margin) {
        pdf.addPage(); // Add a new page if needed
        currentY = margin; // Reset text margin for the new page
      }
      pdf.text(line, textX, currentY);
      currentY += 10; // Line height
    });

    currentY += 70; // Extra space after the text
  }

  // Function to add the table data to the PDF using autoTable
  function addTable() {
    const keys = Object.keys(data[0]).filter(key => key !== 'remarks');
    const rows = data.map(item => keys.map(key => item[key]));

    pdf.autoTable({
      head: [['Barangay (Area)', 'Rating']],
      body: rows,
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid'
    });
  }

  // Chain all the functions together to generate the PDF
  try {
    addTitle(); // Add title first
    addLegendCard() // Add legend card
      .then(addMap) // Add map image after legend
      .then(addInterpretationText) // Add interpretation text
      .then(addTable) // Add table data
      .finally(() => pdf.save(filename)) // Save the PDF
      .catch(err => console.error('Error generating PDF:', err));
  } catch (err) {
    console.error('Error generating PDF:', err);
  }
}
