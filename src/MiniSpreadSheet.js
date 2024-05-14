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

  renderCellTextBox(cellId) {
    const { data } = this;
    const value = data[cellId]?.formula || data[cellId]?.value || '';

    const tbox = document.createElement('input');
    tbox.type = 'text';
    tbox.value = value;

    tbox.onblur = this.handleCellBlur.bind(this);
    return tbox;
  }

  destroy() {
    this.container.innerHTML = '';
  }

  evaluate(value) {
    let formula = value.startsWith('=') ? value.slice(1) : value;
    let expression = '';

    //split cells and operators
    formula = formula.toUpperCase().split(/([*\/+\-])/);

    try {
      for (const cell of formula) {
        if (/[*\/+\-]/.test(cell)) {
          expression += cell; //operators
        } else {
          expression += this.evaluateFormula(cell);
        }
      }
    } catch (error) {
      // throw new Error(error);
      return '#ERROR!';
    }

    return this.evaluateExpression(expression);
  }

  evaluateFormula(cell) {
    let expression;

    switch (true) {
      //check if cell in data then return value
      case cell in this.data:
        expression = this.data[cell].value;

        break;
      //check if number
      case /^\d+(\.\d+)?$/.test(cell):
        expression = cell;

        break;
      //check if no data value but existing cell address
      case document.querySelector(`#${cell}`) !== null:
        expression = 0;

        break;
      default:
        console.log('Error', 'Evaluate Formula');
        throw new Error('Evaluate Formula');
    }

    return expression;
  }

  evaluateExpression(expression) {
    return new Function(`return ${expression}`)();
  }

  /**
   * @todo improve later, static for now.
   */
  getHeaderLabels() {
    return [' ', ...tableHeaders];
  }

  handleCellBlur(e) {
    const { parentElement, value } = e.target;
    const { id } = parentElement;

    let newValue = value;
    let formula;

    if (value.startsWith('=')) {
      newValue = this.evaluate(value);
      formula = value;
    }

    if (newValue.toString().includes('ERROR')) {
      parentElement.textContent = newValue;
      return false;
    }

    parentElement.textContent = newValue;

    this.saveData(id, newValue, formula);
  }

  handleCellClick(e) {
    const { target } = e;
    const { textContent, tagName, id } = target;

    if (tagName === 'INPUT') return;

    const tbox = this.renderCellTextBox(id);

    target.textContent = '';
    target.appendChild(tbox);
    tbox.focus();
  }

  repopulateCells() {
    console.log('repopulate');

    const { data } = this;

    for (const cellId in data) {
      if (data[cellId].formula) {
        const value = this.evaluate(data[cellId].formula);

        this.data[cellId] = { ...this.data[cellId], value };
      }

      const cell = document.querySelector(`#${cellId}`);
      if (cell) {
        cell.textContent = this.data[cellId].value;
      }
    }
  }

  saveData(cellId, value, formula) {
    console.log('save data');

    const id = cellId.toUpperCase();
    const cellData = this.data[id];

    this.data[id] = { ...(cellData || []), value, formula };
    this.repopulateCells();
  }
}
