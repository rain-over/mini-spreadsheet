class MiniSpreadSheet {
  constructor(data = [], size = [100, 100], containerID = 'mini-sprdxt') {
    this.container = document.querySelector(`#${containerID}`);
    this.data = data;
    this.size = size;
  }

  render() {
    const headerLabels = this.getHeaderLabels();
    const {
      data,
      size: [row, column],
    } = this;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const thead_tr = document.createElement('tr');

    //headers
    for (let c = 0; c <= column; c++) {
      const th = document.createElement('th');
      th.textContent = headerLabels[c];
      thead_tr.appendChild(th);
    }
    thead.appendChild(thead_tr);

    //content
    for (let r = 1; r <= row; r++) {
      const tr = document.createElement('tr');

      for (let c = 0; c <= column; c++) {
        const cellId = headerLabels[c] + r;
        let td = document.createElement('td');

        td.id = cellId;
        td.onclick = this.handleCellClick.bind(this);

        if (cellId in data) {
          const { value } = data[cellId];
          td.textContent = value;
        }

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

    if (!this.container) {
      const newContainer = document.createElement('div');
      newContainer.id = 'mini-sprdxt';

      document.body.appendChild(newContainer);
      this.container = newContainer;
    }
    this.container.appendChild(table);
  }

  renderCellTextBox(cell, text) {
    const tbox = document.createElement('input');
    tbox.type = 'number';
    tbox.value = text;

    // tbox.onblur = () => {
    //   console.log('blur');
    //   cell.textContent = tbox.value;
    // };
    tbox.onblur = this.handleCellBlur.bind(this);
    return tbox;
  }

  destroy() {
    this.container.innerHTML = '';
  }

  /**
   * @todo improve later, static for now.
   */
  getHeaderLabels() {
    return [' ', ...tableHeaders];
  }

  handleCellBlur(e) {
    const { target } = e;
    const { parentElement, value } = e.target;
    const { id } = parentElement;

    parentElement.textContent = value;

    this.saveData(id, value);
  }

  handleCellClick(e) {
    const { target } = e;
    const { textContent, tagName } = target;
    const tbox = this.renderCellTextBox(target, textContent);

    if (target.tagName === 'INPUT') return;

    target.textContent = '';
    target.appendChild(tbox);
    tbox.focus();
  }

  saveData(cellId, newValue) {
    const id = cellId.toUpperCase();

    const cellData = this.data[id];

    this.data[id] = { ...(cellData || []), value: newValue };
  }
}
