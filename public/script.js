document.getElementById("csvFile").addEventListener("change", handleCSV);

function handleCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => parseCSV(e.target.result);
  reader.readAsText(file);
}

function parseCSV(csv) {
  const rows = csv.trim().split('\n').map(r => r.split(','));
  const dataRows = rows.slice(1);

  // Count models per building
  const buildings = {};

  dataRows.forEach(row => {
    const [model, serial, radioId, customer, building] = row.map(v => v.trim());

    if (!buildings[building]) buildings[building] = {};
    if (!buildings[building][model]) buildings[building][model] = 0;

    buildings[building][model]++;
  });

  // Build ASCII output
  let output = "";

  Object.keys(buildings).forEach(buildingName => {
    output += `[ ${buildingName} ]\n`;
    output += `+----------------------------------+\n`;

    Object.keys(buildings[buildingName]).forEach(model => {
      const count = buildings[buildingName][model];

      const line = `| [${model} IMG]   ${model}   Count: ${count} |`;
      output += line + "\n";
    });

    output += `+----------------------------------+\n\n`;
  });

  // Display in <pre>
  document.getElementById("asciiOutput").textContent = output;
}
