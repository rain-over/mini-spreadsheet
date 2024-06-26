class MiniSpreadSheet {
  _functions = ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'];

  constructor(data = [], size = [100, 100], containerID = 'mini-sprdxt') {
    this.activeCell = 'A1';
    this.container = document.querySelector(`#${containerID}`);
    this.data = data;
    this.size = size;
  }

  /**
   * @todo: divide into smaller function
   */
  render() {
    const headerLabels = this.getHeaderLabels();
    const {
      data,
      size: [row, column],
      activeCell,
    } = this;

    const formatter = this.renderFormatButtons();
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const thead_tr = document.createElement('tr');
    const activeCol = activeCell.match(/[A-Z]+/)[0];
    const activeRow = activeCell.match(/[0-9]+/)[0];

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
          const { value, format } = data[cellId];
          td.textContent = value;
          td.classList.add(...(format || []));
        }

        if (activeCell === cellId) {
          td.classList.add('active');
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
    this.container.appendChild(formatter);
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

  renderFormatButtons() {
    const container = document.createElement('div');
    container.classList.add('mini-sprdxt-formatter');

    const bold = document.createElement('div');
    bold.setAttribute('id', 'bold');
    bold.textContent = 'B';
    bold.onclick = this.handleFormatToggle.bind(this);

    const italic = document.createElement('div');
    italic.setAttribute('id', 'italic');
    italic.textContent = 'I';
    italic.onclick = this.handleFormatToggle.bind(this);

    const underline = document.createElement('div');
    underline.setAttribute('id', 'underline');
    underline.textContent = 'U';
    underline.onclick = this.handleFormatToggle.bind(this);

    container.appendChild(bold);
    container.appendChild(italic);
    container.appendChild(underline);

    return container;
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
        const functionName = this._functions.find((f) => cell.startsWith(f));

        if (/[*\/+\-]/.test(cell)) {
          //check if operator
          expression += cell;
        } else if (functionName) {
          //check if a function
          expression += this.evaluateFunction(cell, functionName);
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

  evaluateExpression(expression) {
    return new Function(`return ${expression}`)();
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

  /**
   * @todo Handle comma (,) in range.
   * @todo Implement other functions.
   * @todo recalculate value if cell in range has formula.
   */
  evaluateFunction(cell, functionName) {
    console.log('eval function');
    // regex to check if function has range; check if function is valid.
    // =sum(A1:A10)
    const match = cell.match(/\(([^)]+)\)/);
    let expression = [];
    let value;

    if (match) {
      const [start, end] = match[1].split(':');
      const range = this.getCellsinRange(start, end);

      for (const c of range) {
        const cellValue = this.evaluateFormula(c);

        expression.push(+cellValue);
      }

      value = calculate[functionName](expression);
    } else {
      throw new Error('Invalid Formula');
    }
    return value;
  }

  getCellsinRange(start, end) {
    const columnRegex = /[A-Z]+/;
    const rowRegex = /[0-9]+/;

    const rowStart = +start.match(rowRegex)[0];
    const rowEnd = +end.match(rowRegex)[0];

    const colStart = tableHeaders.indexOf(start.match(columnRegex)[0]);
    const colEnd = tableHeaders.indexOf(end.match(columnRegex)[0]);

    const rowMax = Math.max(rowStart, rowEnd);
    const rowMin = Math.min(rowStart, rowEnd);
    const colMax = Math.max(colStart, colEnd);
    const colMin = Math.min(colStart, colEnd);

    let cells = [];

    for (let r = rowMin; r <= rowMax; r++) {
      for (let c = colMin; c <= colMax; c++) {
        cells.push(`${tableHeaders[c]}${r}`);
      }
    }

    return cells;
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

    this.setActiveCell(id);
  }

  /**
   * @todo Add active class for format buttons
   */
  handleFormatToggle(e) {
    console.log('format');
    const { id } = e.target;
    const { activeCell } = this;
    const data = { ...this.data[activeCell] };

    // document.querySelector(`#${activeCell}`).classList.add(id);

    if (data.format) {
      if (data.format.includes(id)) {
        const format = this.data[activeCell].format.filter((x) => x !== id);

        this.data[activeCell].format = [...format];
      } else {
        this.data[activeCell].format.push(id);
      }
    } else {
      this.data[activeCell] = { ...data, format: [id] };
    }

    document.querySelector(`#${activeCell}`).className = 'active';
    this.data[activeCell]?.format.forEach((s) => {
      document.querySelector(`#${activeCell}`).classList.add(s);
    });
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

  setActiveCell(id) {
    this.activeCell = id;

    document.querySelectorAll('td.active').forEach((td) => {
      td.classList.remove('active');
    });
    document.querySelector(`#${id}`).classList.add('active');
  }
}
