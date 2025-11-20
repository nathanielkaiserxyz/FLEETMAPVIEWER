document.getElementById('csvFile').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const rows = e.target.result.split('\n').map(r => r.split(','));
        const table = document.getElementById('output');
        table.innerHTML = ''; // clear previous

        rows.forEach((row, i) => {
          const tr = document.createElement('tr');
          row.forEach(cell => {
            const c = document.createElement(i === 0 ? 'th' : 'td');
            c.textContent = cell.trim();
            tr.appendChild(c);
          });
          table.appendChild(tr);
        });
      };
      reader.readAsText(file);
    });