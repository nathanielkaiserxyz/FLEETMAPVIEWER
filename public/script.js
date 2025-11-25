document.getElementById("csvFile").addEventListener("change", handleCSV);

function handleCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => parseCSV(e.target.result);
  reader.readAsText(file);
}

function parseCSV(csv) {
  const showImage = document.getElementById("showImage").checked;

  const rows = csv.trim().split('\n').map(r => r.split(','));
  const dataRows = rows.slice(1);

  // Model type mapping: handheld vs base station
  const handheldModels = ['PD782', 'HP702', 'HP782']; // Add more handhelds
  const baseStationModels = ['HM702', 'HM782']; // Add base stations

  // Count models per building per customer
  const buildings = {};

  dataRows.forEach(row => {
    const [model, serial, radioId, customer, building, customerName] = row.map(v => v.trim());

    if (!buildings[building]) buildings[building] = [];
    buildings[building].push({ model, customerName });
  });

  let output = "";

  Object.keys(buildings).forEach(buildingName => {
    const tableRows = [];

    // Prepare rows with type and count per model+customer
    const countMap = {}; // key = model|customer
    buildings[buildingName].forEach(item => {
      const key = `${item.model}|${item.customerName}`;
      countMap[key] = (countMap[key] || 0) + 1;
    });

    Object.keys(countMap).forEach(key => {
      const [model, customer] = key.split('|');
      const count = countMap[key];

      // Determine type image placeholder
      let type = '';
      if (handheldModels.includes(model)) type = '#8**';
      else if (baseStationModels.some(m => model.startsWith(m))) type = 'MM_/';
      else type = '???';

      const rowObj = {
        MODEL: model,
        PLACE: customer,
        COUNT: count.toString()
      };

      if (showImage) rowObj.TYPE = type;

      tableRows.push(rowObj);
    });

    if (tableRows.length === 0) return;

    // Determine columns dynamically
    const columns = showImage ? ['TYPE', 'MODEL', 'PLACE', 'COUNT'] : ['MODEL', 'PLACE', 'COUNT'];

    // Determine max width for each column
    const colWidths = {};
    columns.forEach(col => {
      colWidths[col] = Math.max(
        col.length,
        ...tableRows.map(r => r[col].length)
      );
    });

    // Build border
    const border = '+' + columns.map(col => '-'.repeat(colWidths[col] + 2)).join('+') + '+';

    // Header
    const header = '| ' + columns.map(col => col.padEnd(colWidths[col])).join(' | ') + ' |';

    output += `[ ${buildingName} ]\n`;
    output += border + "\n";
    output += header + "\n";
    output += border + "\n";

    // Output each row
    tableRows.forEach(r => {
      const line = '| ' + columns.map(col => r[col].padEnd(colWidths[col])).join(' | ') + ' |';
      output += line + "\n";
    });

    output += border + "\n\n";
  });

  document.getElementById("asciiOutput").textContent = output;
}
