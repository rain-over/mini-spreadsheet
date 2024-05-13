const size = [100, 100];
const container = document.querySelector('#mini-sprdxt');

/**
 * @todo improve later, static for now.
 */
function getHeaderLabels() {
  return [' ', ...tableHeaders];
}

function renderTable() {
  const headerLabels = getHeaderLabels();
  const [row, column] = size;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const thead_tr = document.createElement('tr');
  for (let c = 0; c <= column; c++) {
    const th = document.createElement('th');
    th.textContent = headerLabels[c];
    thead_tr.appendChild(th);
  }
  thead.appendChild(thead_tr);

  for (let r = 1; r <= row; r++) {
    const tr = document.createElement('tr');

    for (let c = 0; c <= column; c++) {
      let td = document.createElement('td');

      td.textContent = `${headerLabels[c]}${r}`;

      if (c === 0) {
        td = document.createElement('th');
        td.textContent = r;
      }

      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);
}

(function () {
  renderTable();
})();
