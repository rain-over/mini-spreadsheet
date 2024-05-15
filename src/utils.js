const getCellsinRange = (headers, start, end) => {
  const columnRegex = /[A-Z]+/;
  const rowRegex = /[0-9]+/;

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

const getTableHeaders = (colCount = 26) => {
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

const calculate = {
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

export { calculate, getTableHeaders, getCellsinRange };
