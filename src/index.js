const size = [100, 100];
const container = document.querySelector('#mini-sprdxt');

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

      td.onclick = handleCellClick;

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

function renderCellTextBox(cell, text) {
  const tbox = document.createElement('input');
  tbox.type = 'number';
  tbox.value = text;

  tbox.onblur = () => {
    console.log('blur');
    cell.textContent = tbox.value;
  };

  return tbox;
}

/**
 * @todo improve later, static for now.
 */
function getHeaderLabels() {
  return [' ', ...tableHeaders];
}

function handleCellClick(e) {
  const { target } = e;
  const { textContent, tagName } = target;
  const tbox = renderCellTextBox(target, textContent);

  if (target.tagName === 'INPUT') return;

  target.textContent = '';
  target.appendChild(tbox);
  tbox.focus();
}

(function () {
  renderTable();
})();
