import {
  calculate,
  getCellsinRange,
  getCellAdjacent,
  getNextCell,
  getRowAndColById,
  getTableHeaders,
} from '../../lib/utils/utils.js';

export default class MiniSpreadSheet {
  _functions = ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'];
  _tableID = 'mini-sprdxt-table';
  _directions = 'down' | 'left' | 'right' | 'up';

  constructor(data = [], size = [100, 100], containerID = 'mini-sprdxt') {
    this.activeCell = 'A1';
    this.container = document.querySelector(`#${containerID}`);
    this.data = data;
    this.keyPressed = false;
    this.size = size;
    this.tableHeaders = '';
  }

  /**
   * @todo: divide into smaller function
   */
  render() {
    const tableHeaders = getTableHeaders(this.size[0]);
    const {
      data,
      size: [row, column],
      activeCell,
    } = this;

    const formatButtons = this.renderFormatButtons();
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const thead_tr = document.createElement('tr');

    //headers
    for (let c = 0; c <= column; c++) {
      const th = document.createElement('th');
      th.textContent = tableHeaders[c];
      thead_tr.appendChild(th);
    }
    thead.appendChild(thead_tr);

    //body
    for (let r = 1; r <= row; r++) {
      const tr = document.createElement('tr');

      for (let c = 0; c <= column; c++) {
        const cellId = tableHeaders[c] + r;
        let td = document.createElement('td');

        td.id = cellId;
        td.tabIndex = -1;

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
    table.id = this._tableID;

    if (!this.container) {
      const newContainer = document.createElement('div');
      newContainer.id = 'mini-sprdxt';

      document.body.appendChild(newContainer);
      this.container = newContainer;
    }
    this.container.appendChild(formatButtons);
    this.container.appendChild(table);
    this.tableHeaders = tableHeaders;

    this.AddHandlers();
    this.setActiveCell(this.activeCell);
  }

  renderCellTextBox(cellId) {
    const { data } = this;
    const value = data[cellId]?.formula || data[cellId]?.value || '';

    const tbox = document.createElement('input');
    tbox.type = 'text';
    tbox.value = value;

    return tbox;
  }

  renderFormatButtons() {
    const container = document.createElement('div');
    container.classList.add('mini-sprdxt-formatButtons');

    const bold = document.createElement('div');
    bold.setAttribute('id', 'bold');
    bold.textContent = 'B';

    const italic = document.createElement('div');
    italic.setAttribute('id', 'italic');
    italic.textContent = 'I';

    const underline = document.createElement('div');
    underline.setAttribute('id', 'underline');
    underline.textContent = 'U';

    container.appendChild(bold);
    container.appendChild(italic);
    container.appendChild(underline);

    return container;
  }

  AddHandlers() {
    const { container } = this;
    const table = container.querySelector(`#${this._tableID}`);
    const formatButtons = container.querySelector('.mini-sprdxt-formatButtons');

    formatButtons.addEventListener('click', (e) => {
      this.handleFormatToggle(e);
    });
    table.addEventListener('focusout', (e) => {
      this.handleCellBlur(e);
    });
    table.addEventListener('click', (e) => {
      this.handleCellClick(e);
    });
    table.addEventListener('keydown', (e) => {
      // console.log('Key pressed:', e.key);
      this.handleKeyPress(e);
    });

    table.focus();
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
      console.log('Error', error);
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
    const { tableHeaders } = this;
    const match = cell.match(/\(([^)]+)\)/);
    let expression = [];
    let value;

    if (match) {
      const [start, end] = match[1].split(':');
      const range = getCellsinRange(tableHeaders, start, end);

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

  getTableHeaders(colCount = 100) {
    colCount += 1;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charsArray = [...chars];
    let nextChar = [0, 0];

    loop1: while (colCount > charsArray.length) {
      const c = [];

      for (const char of nextChar) {
        c.unshift(charsArray[char]);
      }

      for (let i = 0; i < nextChar.length; i++) {
        const charIndex = ++nextChar[i];
        if (charIndex >= chars.length) {
          nextChar[i] = 0;
        } else {
          charsArray.push(c.join(''));
          continue loop1;
        }
      }

      charsArray.push(c.join(''));
      nextChar = [...nextChar, 0];
    }
    return ['◢', ...charsArray].slice(0, colCount);
  }

  handleCellBlur(e) {
    if (this.keyPressed) {
      this.keyPressed = false;
      return;
    }
    if (e.target.tagName !== 'INPUT') {
      return;
    }

    console.log('blur');

    const { parentElement, value } = e.target;

    this.setCellTextContent(parentElement, value);
  }

  handleCellClick(e) {
    const { target } = e;
    const { textContent, tagName, id } = target;

    if (tagName !== 'TD') return;

    this.setActiveCell(id);

    const tbox = this.renderCellTextBox(id);

    target.textContent = '';
    target.appendChild(tbox);
    tbox.focus();
  }

  handleKeyPress(e) {
    const { key } = e;
    const arrowKeys = ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'];

    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleKeyPressArrows(e);
        break;
      case 'Enter':
        this.handleKeyPressEnter(e);
        break;
      case 'Escape':
        this.handleKeyPressEscape(e);
        break;
      case 'Tab':
        break;

      default:
        const { target } = e;
        if (target.tagName === 'TD' && target.children.length === 0) {
          target.click();
        }
        break;
    }
  }

  handleKeyPressArrows(e) {
    e.preventDefault();

    this.keyPressed = true;

    const direction = {
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
    };

    const { key, target, type } = e;
    if (type !== 'keypress' && !(key in direction)) {
      return;
    }

    let currentCell = target;
    const { parentElement, value, tagName } = target;
    if (tagName === 'INPUT') {
      this.setCellTextContent(parentElement, value);
      currentCell = parentElement;
    } else {
      console.log('test');
    }

    this.moveCell(currentCell, direction[key]);
  }

  handleKeyPressEscape(e) {
    this.keyPressed = true;

    const { target } = e;
    const { parentElement, tagName } = target;

    const cell = tagName === 'TD' ? target : parentElement;

    if (cell.tagName !== 'TD') return;

    const { id } = cell;
    const value = this.data[id]?.value;

    cell.textContent = value || '';
    cell.focus();
  }

  handleKeyPressEnter(e) {
    this.keyPressed = true;

    const { key, target, type } = e;
    if (type !== 'keypress' && key !== 'Enter') {
      return;
    }

    let currentCell = target;
    const { parentElement, value, tagName } = target;
    if (tagName === 'INPUT') {
      this.setCellTextContent(parentElement, value);
      currentCell = parentElement;
    } else {
      console.log('test');
    }

    this.moveCell(currentCell, 'down');
  }

  premove() {}

  /**
   * @todo Add active class for format buttons
   */
  handleFormatToggle(e) {
    console.log('format');
    const { id } = e.target;
    if (!id) return;

    const { activeCell } = this;
    const data = { ...this.data[activeCell] };

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

  moveCell(cell, direction) {
    console.log('move cell');
    if (cell.tagName !== 'TD') return;

    const { tableHeaders } = this;
    const [columnLabel, row] = cell.id.match(/[A-Z]+|[0-9]+/g);
    const [nextColumn, nextRow] = getNextCell[direction](
      tableHeaders.indexOf(columnLabel),
      +row
    );

    const nextCellId = `${tableHeaders[nextColumn]}${nextRow}`;

    if (!this.container.querySelector(`#${nextCellId}`)) return;

    this.setActiveCell(nextCellId);
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

  setData(cellId, value, formula) {
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

    const activeCell = document.querySelector(`#${id}`);
    activeCell.classList.add('active');
    activeCell.focus();
  }

  setCellTextContent(cell, value) {
    const { id } = cell;
    let newValue = value;
    let formula;

    if (value.startsWith('=')) {
      newValue = this.evaluate(value);
      formula = value;
    }

    if (newValue.toString().includes('ERROR')) {
      cell.textContent = newValue;
      return false;
    }

    cell.textContent = newValue;

    this.setData(id, newValue, formula);
  }
}
