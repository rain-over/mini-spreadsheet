import {
  calculate,
  cellDataToGraph,
  getCellsinRange,
  getNextCell,
  getTableHeaders,
  sortGraph,
} from '../../lib/utils/utils.js';

import {
  alphabet,
  colRowRegex,
  numbersRegex,
  operatorsRegex,
  valueInParenthesisRegex,
} from '../../lib/utils/constants.js';

const FUNCTIONS = ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'];
const ID = 'mini-sprdxt';
const TABLE_ID = 'mini-sprdxt-table';

export default class MiniSpreadSheet {
  constructor(
    data = {},
    size = [100, 100],
    containerID = 'mini-sprdxt-container'
  ) {
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
    table.id = `${ID}-table`;

    if (!this.container) {
      const newContainer = document.createElement('div');
      newContainer.id = `${ID}-container`;

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
    container.classList.add(`${ID}-formatButtons`);

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
    const table = container.querySelector(`#${ID}-table`);
    const formatButtons = container.querySelector(`.${ID}-formatButtons`);

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
    if (!value.startsWith('=')) {
      return value;
    }

    let formula = value.slice(1);
    let expression = '';

    ///Validate if formula/function is valid.
    //split cells and operators
    formula = formula.toUpperCase().split(operatorsRegex);

    for (const cell of formula) {
      const functionName = FUNCTIONS.find((f) => cell.startsWith(f));

      if (operatorsRegex.test(cell)) {
        // check if operator: * / + -
        expression += cell;
      } else if (functionName) {
        //check if a function: sum, avg, etc.
        expression += this.evaluateFunction(cell, functionName);
      } else {
        expression += this.evaluateFormula(cell);
      }
    }

    return this.evaluateExpression(expression);
  }

  evaluateExpression(expression) {
    //eval() parse string expression
    return expression === '' ? 0 : new Function(`return ${expression}`)();
  }

  evaluateFormula(cell) {
    let expression;
    const { data } = this;

    switch (true) {
      case cell in data:
        //get cell data
        expression = data[cell].value || 0;
        break;

      case numbersRegex.test(cell):
        //check if number
        expression = cell;
        break;

      // case document.querySelector(`#${cell}`) !== null:
      //   //check if no data value but existing cell address
      //   expression = 0;
      //   break;

      default:
        const [row, col] = cell.match(colRowRegex);
        if (row && col) {
          if (document.querySelector(`#${cell}`) !== null) {
            expression = 0;
          }
        } else {
          console.log('Error', 'Evaluate Formula');
          throw new Error('Invalid Formula');
        }
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

    const { tableHeaders } = this;
    const match = cell.match(valueInParenthesisRegex); // get value inside ( )

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
      throw new Error('Invalid Function');
    }
    return value;
  }

  getTableHeaders(colCount = 100) {
    colCount += 1;
    const charsArray = [...alphabet];
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

    this.write(parentElement, value);
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
      this.write(parentElement, value);
      currentCell = parentElement;
    } else {
      console.log('arrow INPUT else');
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
      this.write(parentElement, value);
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
    const [columnLabel, row] = cell.id.match(colRowRegex);
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

  saveData(cellId, value, formula) {
    const id = cellId.toUpperCase();
    const cellData = this.data[id];

    this.data[id] = { ...(cellData || []), value, formula };
  }

  setData(cell, value, formula) {
    this.saveData(cell.id, value, formula);
    cell.textContent = value;
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

  write(cell, value) {
    const { id } = cell;

    let formula = '';
    let newValue = '';
    let updateOrder = [];

    // evaluate and validate formula
    try {
      newValue = this.evaluate(value);
      updateOrder = this.getUpdateOrder(id, value, newValue);
    } catch (error) {
      cell.textContent = `#Error: ${error}`;
      return false;
    }

    formula = newValue === value ? '' : value;
    this.setData(cell, newValue, formula);

    if (updateOrder.length) {
      this.updateDependencies(id, updateOrder);
    }
  }

  getUpdateOrder(id, value, newValue) {
    let tempData = { ...this.data };

    tempData[id] = {
      ...(newValue === '' ? { value } : { value: newValue, formula: value }),
    };

    console.log('validate', tempData);
    const cellDataGraph = cellDataToGraph(tempData);
    const sortedGraph = sortGraph(cellDataGraph);
    const hasFormula = Object.values(tempData).some(
      (obj) => obj.formula && obj.formula.trim() !== ''
    );

    if (!sortedGraph.length && hasFormula) {
      throw new Error('Circular reference detected.');
    }

    return sortedGraph;
  }

  updateDependencies(id, cellUpdateOrder) {
    let newOrder = [...cellUpdateOrder];

    if (cellUpdateOrder.indexOf(id) >= 0) {
      newOrder = newOrder.slice(
        cellUpdateOrder.indexOf(id) + 1,
        cellUpdateOrder.length
      );
    }

    const { data } = this;

    for (const cellId of newOrder) {
      console.log(cellId);

      const { formula = '', value } = data[cellId];
      const cell = document.querySelector(`#${cellId}`);
      const newValue = this.evaluate(formula);

      this.setData(cell, formula === '' ? value : newValue, formula);
    }
  }
}
