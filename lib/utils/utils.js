import { colRowRegex } from './constants.js';

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

export const getNextCell = {
  up: (x, y) => [x, --y],
  down: (x, y) => [x, ++y],
  left: (x, y) => [--x, y],
  right: (x, y) => [++x, y],
};

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

export const calculate = {
  SUM: (range) => {
    return range.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
  },
  AVERAGE: (range) => range,
  COUNT: (range) => range,
  MAX: (range) => range,
  MIN: (range) => range,
};

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
 * Topological Sort
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
