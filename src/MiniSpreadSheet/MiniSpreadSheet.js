import {
  calculate,
  cellDataToGraph,
  convertToPostFix,
  getCellsinRange,
  getNextCell,
  getTableHeaders,
  sortGraph,
  postfixEvaluator,
} from '../../lib/utils/utils.js';

import {
  alphabet,
  colRowRegex,
  numbersRegex,
  operatorsRegex,
  valueInParenthesisRegex,
} from '../../lib/utils/constants.js';

const ID = 'mini-sprdxt';

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
   * destroy.
   */
  destroy() {
    this.container.innerHTML = '';
  }

  /**
   * render.
   */
  render() {
    const formatButtons = this.renderFormatButtons();
    const table = this.renderTable();

    if (!this.container) {
      this.renderContainer();
    }
    this.container.appendChild(formatButtons);
    this.container.appendChild(table);

    this.AddHandlers();
    this.setActiveCell(this.activeCell);
  }

  /**
   * Render Table Container.
   */
  renderContainer() {
    const container = document.createElement('div');

    container.id = `${ID}-container`;
    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * Creates markup for the format buttons.
   * @returns {HTMLElement} container for format buttons.
   */
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

  /**
   * Creates Table markup with head, body and cells.
   * @returns {HTMLTableElement} returns table markup.
   */
  renderTable() {
    const tableHeaders = getTableHeaders(this.size[0]);
    const {
      activeCell,
      data,
      size: [row, column],
    } = this;

    this.tableHeaders = tableHeaders;

    const table = document.createElement('table');
    const thead = this.renderTableHead(tableHeaders);
    const tbody = this.renderTableBody(
      row,
      column,
      data,
      activeCell,
      tableHeaders
    );

    table.appendChild(thead);
    table.appendChild(tbody);
    table.id = `${ID}-table`;

    return table;
  }

  /**
   * Creates markup for table tbody.
   * @param {number} row - row size.
   * @param {number} column = column size.
   * @param {Object} data - contains table data.
   * @param {string[]} data.format - contains applied format to the cell: Bold, Italic, Underline.
   * @param {string} data.value - formula for the cell, should start with '='.
   * @param {string} data.value - display value of the cell.
   * @param {string} activeCell - cell address.
   * @param {string[]} tableHeaders - array of string: A, B,... Y, Z, AA, AB,.. etc.
   * @returns {HTMLTableSectionElement} - returns tbody containing all the generated cells.
   */
  renderTableBody(row, column, data, activeCell, tableHeaders) {
    const tbody = document.createElement('tbody');

    for (let r = 1; r <= row; r++) {
      const tr = document.createElement('tr');

      for (let c = 0; c <= column; c++) {
        const cellId = `${tableHeaders[c]}${r}`;
        const td = this.renderTableCell(data, activeCell, cellId, c, r);

        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    return tbody;
  }

  /**
   * Creates Markup for for table cells.
   * @param {Object} data - contains table data.
   * @param {string[]} data.format - contains applied format to the cell: Bold, Italic, Underline.
   * @param {string} data.value - formula for the cell, should start with '='.
   * @param {string} data.value - display value of the cell.
   * @param {string} activeCell - cell address.
   * @param {string} cellId - cell Id.
   * @param {number} c - column index.
   * @param {number} r - row index.
   * @returns {HTMLTableRowElement} - markup of table cells.
   */
  renderTableCell(data, activeCell, cellId, c, r) {
    let td = document.createElement('td');

    td.id = cellId;
    td.tabIndex = -1;
    if (data.hasOwnProperty(cellId)) {
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

    return td;
  }

  /**
   * Creates markup for input inside a Table cell.
   * @param {number} cellId - cell Id.
   * @returns {HTMLInputElement} textbox.
   */
  renderTableCellTextBox(cellId) {
    const { data } = this;
    const value = data[cellId]?.formula || data[cellId]?.value || '';

    const tbox = document.createElement('input');
    tbox.type = 'text';
    tbox.value = value;

    return tbox;
  }

  /**
   * Creates markup for table thead.
   * @param {string[]} headers - array of string: A, B,... Y, Z, AA, AB,.. etc.
   * @returns {HTMLTableSectionElement} - returns thead containing all the generated table headers.
   */
  renderTableHead(headers) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      tr.appendChild(th);
    });
    thead.appendChild(tr);

    return thead;
  }

  /**
   * Add Handlers for events performed on the sheet.
   */
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

  /**
   * Handles event when a Table cell loses its focus.
   * @param {Event} e - Event object.
   * @returns {void} if target is not Input or keyPressed property is true.
   */
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

  /**
   * Handles the click event on Table cells.
   * @param {MouseEvent} e - The mouse event object.
   * @returns {void} if target is not a Table cell.
   */
  handleCellClick(e) {
    const { target } = e;
    const { textContent, tagName, id } = target;

    if (tagName !== 'TD') return;

    this.setActiveCell(id);

    const tbox = this.renderTableCellTextBox(id);

    target.textContent = '';
    target.appendChild(tbox);
    tbox.focus();
  }

  /**
   * Handles the 'click' event on format buttons.
   * @param {MouseEvent} e - The mouse event object.
   * @returns {void} if format buttons are clicked with no cell active.
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

  /**
   * Catched the 'keydown' event and assign appropriate handling.
   * @param {KeyboardEvent} e - The keyboard event object.
   */
  handleKeyPress(e) {
    const { key } = e;

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

  /**
   * Hanldes the 'keydown' event when an arrow key is pressed.
   * @param {KeyboardEvent} e - The keyboard event object.
   * @returns {void} if key in not an arrow key.
   */
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

  /**
   * Handles the 'keydown' event when 'Enter' is pressed.
   * @param {KeyboardEvent} e - The keyboard event object.
   * @returns {void} if key is not 'Enter'.
   */
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

  /**
   * Handles the 'keydown' event when 'Escape' is pressed.
   * @param {KeyboardEvent} e - The keyboard event object.
   * @returns {void} if target is not a Table cell.
   */
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

  /**
   * Validate if formula/function is valid.
   * @param {string} value - cell value.
   * @returns {string | number} evaluated value if value contains a function or formula.
   */
  evaluate(value) {
    if (!value.startsWith('=')) {
      return value;
    }

    let formula = value.slice(1);
    let expression = '';
    let expressionArray = [];

    //split cells and operators
    formula = formula.toUpperCase().split(operatorsRegex);

    for (const cell of formula) {
      const functionName = Object.keys(calculate).find((f) =>
        cell.startsWith(f)
      );

      if (operatorsRegex.test(cell)) {
        // check if operator: * / + -
        // expression += cell;
        expressionArray.push(cell);
      } else if (functionName) {
        //check if a function: sum, avg, etc.
        // expression += this.evaluateFunction(cell, functionName);
        expressionArray.push(this.evaluateFunction(cell, functionName));
      } else {
        // expression += this.evaluateFormula(cell);
        expressionArray.push(this.evaluateFormula(cell));
      }
    }
    const postfix = convertToPostFix(expressionArray);

    return postfixEvaluator(postfix);
  }

  /**
   * Parses string expression.
   * @param {*} expression
   * @returns {number} parsed value from expression.
   */
  evaluateExpression(expression) {
    return expression === '' ? 0 : new Function(`return ${expression}`)();
  }

  /**
   * Evaluates the cell formula and returns calculated value.
   * @param {string | number} cell - cell address or number for evaluation.
   * @returns {number} cell value.
   */
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
   * Evaluates the cell function and returns calculated value.
   * @param {string} cell - cell address(es) or numbers inside a function parenthesis.
   * @param {string} functionName - {SUM | AVERAGE | COUNT | MAX | MIN}.
   * @returns {number} calculated value from function.
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

  /**
   * Sorts the cells in topological order and validates if not cyclical.
   * @param {number} id current cell id.
   * @param {number|string} value current cell value.
   * @param {number|string} newValue parsed value, if value is a function or formula.
   * @returns {string[]} sortedGraph - sorted cells Ids.
   */
  generateUpdateOrder(id, value, newValue) {
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

  /**
   * Changes Active cells with arrow keys.
   * @param {HTMLTableCellElement} cell  currently interacted cell.
   * @param {string} direction {up | dpwn | left | right}.
   * @returns {void} if called and target is not a table cell.
   */
  moveCell(cell, direction) {
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

  /**
   * Saves validated cell value to Object.
   * @param {number} cellId cell Id.
   * @param {string | number} value parsed cell value.
   * @param {*} formula can be either function or formula.
   */
  saveData(cellId, value, formula) {
    const id = cellId.toUpperCase();
    const cellData = this.data[id];

    this.data[id] = { ...(cellData || []), value, formula };
  }

  /**
   * Targets cell as active, for highlight and formatting.
   * @param {number} id cell Id.
   */
  setActiveCell(id) {
    this.activeCell = id;

    document.querySelectorAll('td.active').forEach((td) => {
      td.classList.remove('active');
    });

    const activeCell = document.querySelector(`#${id}`);
    activeCell.classList.add('active');
    activeCell.focus();
  }

  /**
   *
   * @param {HTMLTableCellElement} cell currently interacted cell.
   * @param {string | number} value parsed cell value.
   * @param {string} formula can be either function or formula.
   */
  setData(cell, value, formula) {
    this.saveData(cell.id, value, formula);
    cell.textContent = value;
  }

  /**
   * Takes cell input for validation, saving and display.
   * @param {HTMLTableCellElement} cell currently interacted cell.
   * @param {string} value cell value.
   * @returns {boolean} false on error.
   */
  write(cell, value) {
    const { id } = cell;

    let formula = '';
    let newValue = '';
    let updateOrder = [];

    value = value.trim();

    // evaluate and validate formula
    try {
      newValue = this.evaluate(value);
      updateOrder = this.generateUpdateOrder(id, value, newValue);
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

  /**
   * Update cells with dependencies in a topological order.
   * @param {number} cell current cell id.
   * @param {string[]} cellUpdateOrder sorted cell ids.
   * @returns {void} if falsy.
   */
  updateDependencies(id, cellUpdateOrder) {
    let newOrder = [...cellUpdateOrder];

    if (cellUpdateOrder.indexOf(id) >= 0) {
      newOrder = newOrder.slice(
        cellUpdateOrder.indexOf(id) + 1,
        cellUpdateOrder.length
      );
    } else {
      return;
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
