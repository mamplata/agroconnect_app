$(document).ready(function() {
  let vegetablesData, riceData, fruitsData;
  let currentDataType;

  fetch('api/soil_healths')
    .then(response => response.json())
    .then(data => {
      vegetablesData = data.filter(record => record.type === "Vegetables");
      riceData = data.filter(record => record.type === "Rice");
      fruitsData = data.filter(record => record.type === "Fruits");

      displayData('vegetables', vegetablesData);
      displayData('rice', riceData);
      displayData('fruits', fruitsData);

      $('.download-btn').click(function() {
        currentDataType = $(this).data('type');
        $('#downloadModal').modal('show');
      });

      $('.download-option').click(function() {
        const format = $(this).data('format');
        if (currentDataType === 'vegetables') {
          downloadData(format, 'Vegetables', vegetablesData);
        } else if (currentDataType === 'rice') {
          downloadData(format, 'Rice', riceData);
        } else if (currentDataType === 'fruits') {
          downloadData(format, 'Fruits', fruitsData);
        }
      });
    })
    .catch(error => console.error('Error fetching data:', error));

  function displayData(type, data) {
    if (data.length === 0) {
      $(`#${type}-body`).html('<p>Data is not available for now.</p>');
      $(`.download-btn[data-type="${type}"]`).hide();
    } else {
      let averages = calculateAverages(data);
      $(`#${type}-phosphorus`).html(`${averages.phosphorus.value} <br>(${averages.phosphorus.percentage}%)`);
      $(`#${type}-nitrogen`).html(`${averages.nitrogen.value} <br>(${averages.nitrogen.percentage}%)`);
      $(`#${type}-potassium`).html(`${averages.potassium.value} <br> (${averages.potassium.percentage}%)`);
      $(`#${type}-ph`).html(`${averages.ph.value} <br>(${averages.ph.percentage}%)`);
      $(`#${type}-general`).html(`${averages.generalRating.value} <br> (${averages.generalRating.percentage}%)`);
    }
  }

  function calculateAverages(records) {
    let totalPhosphorus = 0, totalNitrogen = 0, totalPotassium = 0, totalPH = 0, totalGeneral = 0;
    let count = records.length;

    records.forEach(record => {
      totalPhosphorus += getValue(record.phosphorusContent);
      totalNitrogen += getValue(record.nitrogenContent);
      totalPotassium += getValue(record.potassiumContent);
      totalPH += getValue(record.pH);
      totalGeneral += getValue(record.generalRating);
    });

    return {
      phosphorus: getAverage(totalPhosphorus, count),
      nitrogen: getAverage(totalNitrogen, count),
      potassium: getAverage(totalPotassium, count),
      ph: getAverage(totalPH, count),
      generalRating: getAverage(totalGeneral, count)
    };
  }

  function getValue(content) {
    switch(content) {
      case "L": return 1;
      case "ML": return 2;
      case "MH": return 3;
      case "H": return 4;
      default: return 0;
    }
  }

  function getAverage(total, count) {
    let averageValue = total / count;
    let percentage = (averageValue / 4) * 100; // Since H corresponds to the highest value, which is 4
    return {
      value: convertToText(averageValue),
      percentage: percentage.toFixed(2)
    };
  }

  function convertToText(value) {
    if (value <= 1.5) return 'Low';
    else if (value <= 2.5) return 'Moderately Low';
    else if (value <= 3.5) return 'Moderately High';
    else return 'High';
  }

  function downloadData(format, type, data) {
    const filename = `${type.toLowerCase()}.${format}`;
    if (format === 'csv') {
      downloadCSV(filename, data);
    } else if (format === 'excel') {
      downloadExcel(filename, data);
    } else if (format === 'pdf') {
      downloadPDF(filename, data);
    }
  }

  // Download CSV
  function downloadCSV(filename, data) {
    const csv = [
      ['Type', 'Phosphorus', 'Nitrogen', 'Potassium', 'pH', 'General Rating'],
      ...data.map(record => [
        record.type,
        record.phosphorusContent,
        record.nitrogenContent,
        record.potassiumContent,
        record.pH,
        record.generalRating
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Download Excel
  function downloadExcel(filename, data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filename);
  }

  function downloadPDF(filename, data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.autoTable({
    head: [['Type', 'Phosphorus', 'Nitrogen', 'Potassium', 'pH', 'General Rating']],
    body: data.map(record => [
      record.type,
      record.phosphorusContent,
      record.nitrogenContent,
      record.potassiumContent,
      record.pH,
      record.generalRating
    ]),
    startY: 10,  // Starting Y position of the table
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    theme: 'grid',  // Optional: changes the table style to a grid
  });
  
  doc.save(filename);
}
});
