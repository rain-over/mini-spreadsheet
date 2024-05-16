const columnRegex = /[A-Z]+/;
const rowRegex = /[0-9]+/;

export const getRowAndColById = (id) => {
  return [id.match(rowRegex)[0], id.match(columnRegex)[0]];
};

export const getCellsinRange = (headers, start, end) => {
  const rowStart = +start.match(rowRegex)[0];
  const rowEnd = +end.match(rowRegex)[0];

  const colStart = headers.indexOf(start.match(columnRegex)[0]);
  const colEnd = headers.indexOf(end.match(columnRegex)[0]);

  const rowMax = Math.max(rowStart, rowEnd);
  const rowMin = Math.min(rowStart, rowEnd);
  const colMax = Math.max(colStart, colEnd);
  const colMin = Math.min(colStart, colEnd);

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

export const getCellAdjacent = (cell, direction) => {
  const [row, col] = getRowAndColById(cell.id);
  let adjacentCell;

  if (cell.tagName !== 'TD') return adjacentCell;

  switch (direction) {
    case 'up':
      const parentRow = cell.parentElement;

      const aboveSibling = parentRow.previousElementSibling;
      adjacentCell = aboveSibling.children[1];
      break;
    case 'right':
      adjacentCell = cell.nextElementSibling;
      break;
    case 'down':
      const { parentElement } = cell;
      const rowIndex = Array.from(parentElement.children).indexOf(cell);

      adjacentCell = belowSibling.children[1];

      break;
    case 'left':
      adjacentCell = cell.previousElementSibling;
      break;
  }
  return adjacentCell;
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

// export { calculate, getCellsinRange, getCellAdjacent, getTableHeaders };
