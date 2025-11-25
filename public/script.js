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
  const baseStationModels = ['HM702', 'HM782',]; // Add base stations

  // Count models per building per customer
  const buildings = {};

  dataRows.forEach(row => {
    const [model, serial, radioId, customer, building, customerName] = row.map(v => v.trim());

    if (!buildings[building]) buildings[building] = {};
    if (!buildings[building][model]) buildings[building][model] = {};
    if (!buildings[building][model][customerName]) buildings[building][model][customerName] = 0;

    buildings[building][model][customerName]++;
  });

  // Build ASCII output
  let output = "";

  Object.keys(buildings).forEach(buildingName => {
    const lines = [];

    Object.keys(buildings[buildingName]).forEach(model => {
      const customers = buildings[buildingName][model];

      Object.keys(customers).forEach(customer => {
        const count = customers[customer];

        // Determine model type
        let imagePlaceholder = '';
        if (handheldModels.includes(model)) {
          imagePlaceholder = '#8**';
        } else if (baseStationModels.some(m => model.startsWith(m))) {
          imagePlaceholder = 'MM_/';
        } else {
          imagePlaceholder = '???';
        }

        const line = showImage
          ? `| ${imagePlaceholder}   ${model}   ${customer} Count: ${count} |`
          : `| ${model}   ${customer} Count: ${count} |`;

        lines.push(line);
      });
    });

    if (lines.length === 0) return;

    // Calculate max line length
    const maxLength = Math.max(...lines.map(l => l.length - 2)); // -2 for | |
    const border = '+' + '-'.repeat(maxLength) + '+';

    output += `[ ${buildingName} ]\n`;
    output += border + "\n";

    lines.forEach(line => {
      const content = line.slice(2, -2); // remove | |
      const padded = content.padEnd(maxLength, ' ');
      output += `|${padded}|\n`;
    });

    output += border + "\n\n";
  });

  document.getElementById("asciiOutput").textContent = output;
}
