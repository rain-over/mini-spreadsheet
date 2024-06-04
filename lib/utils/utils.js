import { colRowRegex } from './constants.js';

/**
 * Get cells within the range.
 * @param {string[]} headers - array of headers.
 * @param {string} start - starting cell address.
 * @param {string} end - ending cell address.
 * @returns {string[]} - array of cell addresses within the range.
 */
export const getCellsinRange = (headers, start, end) => {
  const [headerStart, rowNumStart] = start.match(colRowRegex);
  const [headerEnd, rowNumEnd] = end.match(colRowRegex);

  const colStart = headers.indexOf(headerStart);
  const colEnd = headers.indexOf(headerEnd);

  const [rowMax, rowMin] = [
    Math.max(+rowNumStart, +rowNumEnd),
    Math.min(+rowNumStart, +rowNumEnd),
  ];
  const [colMax, colMin] = [
    Math.max(colStart, colEnd),
    Math.min(colStart, colEnd),
  ];

  let cells = [];

  for (let r = rowMin; r <= rowMax; r++) {
    for (let c = colMin; c <= colMax; c++) {
      cells.push(`${headers[c]}${r}`);
    }
  }

  return cells;
};

/**
 * Helper for geting cell coordinate by direction.
 */
export const getNextCell = {
  up: (x, y) => [x, --y],
  down: (x, y) => [x, ++y],
  left: (x, y) => [--x, y],
  right: (x, y) => [++x, y],
};

/**
 * Generate column headers in an array depending on the size of the sheet.
 * @param {number} colCount - number of columns on the current sheet.
 * @returns {string[]} an array of string: A, B,... Y, Z, AA, AB,.. etc.
 */
export const getTableHeaders = (colCount = 26) => {
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
};

/**
 * Helper for calculating formula in cell.
 */
export const calculate = {
  SUM: (range) => {
    return range.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
  },
  AVERAGE: (range) => {
    const sum = range.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    return sum / range.length;
  },
  COUNT: (range) => {
    return range.length;
  },
  MAX: (range) => {
    return Math.max(...range);
  },
  MIN: (range) => {
    return Math.min(...range);
  },
};

/**
 * Convert Sheet data to graph to be topological sort-ready.
 * @param {Object} data - contains table data.
 * @param {string[]} data.format - contains applied format to the cell: Bold, Italic, Underline.
 * @param {string} data.value - formula for the cell, should start with '='.
 * @param {string} data.value - display value of the cell.
 * @returns {Object} graph containing dependencies for each cell.
 */
export const cellDataToGraph = (data) => {
  const graph = {};

  for (const cell in data) {
    const formula = data[cell].formula;
    if (formula) {
      const cellReferences = formula.toUpperCase().match(/[A-Z]+\d+/g);
      graph[cell] = cellReferences ? [...cellReferences] : [];
    }
  }

  return graph;
};

/**
 * Sorts cells with dependencies into an update order array.
 * @param {Object} graph containing dependencies for each cell.
 * @returns {string[]} ordered list of cells for update.
 */
export const sortGraph = (graph) => {
  let sortedNodes = [];
  let visited = [];
  let stack = [];

  const dfs = (node) => {
    visited.push(node);
    stack.push(node);

    for (let neighbor of graph[node] || []) {
      if (!visited.includes(neighbor)) {
        if (dfs(neighbor)) return true; //cycle
      } else if (stack.includes(neighbor)) {
        return true; //cycle
      }
    }

    stack.splice(stack.indexOf(node), 1);
    sortedNodes.push(node);

    return false;
  };

  for (let node in graph) {
    if (!visited.includes(node)) {
      if (dfs(node)) {
        console.log('cycle');
        return [];
      }
    }
  }

  return sortedNodes;
};

const operators = {
  '^': {
    prec: 4,
  },
  '*': {
    prec: 3,
  },
  '/': {
    prec: 3,
  },
  '+': {
    prec: 2,
  },
  '-': {
    prec: 2,
  },
};

export const postfixEvaluator = (input) => {
  const stack = [];

  const handleToken = (token) => {
    if (!isNaN(parseFloat(token))) {
      stack.push(token);
      return;
    }

    const right = parseFloat(stack.pop());
    const left = parseFloat(stack.pop());

    switch (token) {
      case '+': // Addition
        stack.push(left + right);
        return;
      case '-': // Subtraction
        stack.push(left - right);
        return;
      case '*': // Multiplication
        stack.push(left * right);
        return;
      case '/': // Division
        stack.push(left / right);
        return;
      case '^': // Exponentiation
        stack.push(left ** right);
        return;
      default:
        throw new Error(`Invalid token: ${token}`);
    }
  };

  for (let i of input) {
    if (i === ' ') continue;

    handleToken(i);
  }

  return stack.pop();
};

// const result = RPNEvaluator('1 2 +');

export const convertToPostFix = (expressionArray) => {
  const stack = [];
  const postfix = [];

  for (const op of expressionArray) {
    if (operators[op]) {
      const last = stack.at(-1);
      if (stack.length === 0) {
        stack.push(op);
      } else if (operators[last].prec < operators[op].prec) {
        stack.push(op);
        // } else if (last === '^' && op === '^') {
        //   stack.push(op);
      } else {
        while (
          stack.length > 0 &&
          operators[stack.at(-1)].prec >= operators[op].prec
        ) {
          // if (stack.at(-1) === '^' && op === '^') break;
          postfix.push(stack.at(-1));
          stack.pop();
        }
        stack.push(op);
      }
      // } else if (op === '(') {
      //   stack.push(op);
      // } else if (op === ')') {
      //   while (stack.length > 0 && stack.at(-1) !== '(') {
      //     postfix.push(stack.at(-1));
      //     stack.pop();
      //   }
      //   stack.pop();
    } else {
      postfix.push(op);
    }
  }

  while (stack.length > 0) {
    postfix.push(stack.at(-1));
    stack.pop();
  }
  console.log({ stack, postfix });
  return postfix;
};
