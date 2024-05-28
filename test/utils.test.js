import { alphabet } from '../lib/utils/constants';
import {
  calculate,
  cellDataToGraph,
  getCellsinRange,
  getNextCell,
  getTableHeaders,
  sortGraph,
} from '../lib/utils/utils';

const graph = {
  A1: ['B1', 'C1'],
  B1: ['C1', 'D1'],
  D1: ['E1'],
  E1: ['F1'],
  F1: ['G1', 'H1'],
  G1: ['I1'],
  H1: ['I1'],
  I1: [],
};

describe('utils', () => {
  const headers = alphabet.split('');
  describe('getCellsinRange', () => {
    // const headers = alphabet.split('');
    const ranges = [
      {
        headers,
        start: 'A1',
        end: 'A1',
        expected: ['A1'],
      },
      {
        headers,
        start: 'A1',
        end: 'E1',
        expected: ['A1', 'B1', 'C1', 'D1', 'E1'],
      },

      {
        headers,
        start: 'A1',
        end: 'A5',
        expected: ['A1', 'A2', 'A3', 'A4', 'A5'],
      },
    ];

    it('returns correct cells in the range', () => {
      ranges.forEach(({ headers, start, end, expected }) => {
        const result = getCellsinRange(headers, start, end);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('getTableHeaders', () => {
    test('returns correct headers for default column count', () => {
      const expectedHeaders = ['◢', ...headers];

      const result = getTableHeaders();
      expect(result).toEqual(expectedHeaders);
    });

    test('returns correct headers for custom column count', () => {
      let colCount = 5;
      let expectedHeaders = ['◢', ...headers.slice(0, colCount)];

      let result = getTableHeaders(colCount);
      expect(result).toEqual(expectedHeaders);

      colCount = 100;
      expectedHeaders =
        'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,AA,AB,AC,AD,AE,AF,AG,AH,AI,AJ,AK,AL,AM,AN,AO,AP,AQ,AR,AS,AT,AU,AV,AW,AX,AY,AZ,BA,BB,BC,BD,BE,BF,BG,BH,BI,BJ,BK,BL,BM,BN,BO,BP,BQ,BR,BS,BT,BU,BV,BW,BX,BY,BZ,CA,CB,CC,CD,CE,CF,CG,CH,CI,CJ,CK,CL,CM,CN,CO,CP,CQ,CR,CS,CT,CU,CV';
      expectedHeaders = ['◢', ...expectedHeaders.split(',')];

      result = getTableHeaders(colCount);
      expect(result).toEqual(expectedHeaders);
    });
  });

  describe('getNextCell', () => {
    const directions = {
      up: [1, 1],
      down: [2, 2],
      left: [3, 3],
      right: [4, 4],
    };
    const expectedResult = {
      up: [1, 0],
      down: [2, 3],
      left: [2, 3],
      right: [5, 4],
    };

    for (const direction in directions) {
      it(`should return the coordinate of the cell ${direction}`, () => {
        const [x, y] = directions[direction];
        const [x1, y1] = expectedResult[direction];
        const result = getNextCell[direction](x, y);

        expect(result).toEqual([x1, y1]);
      });
    }
  });

  describe('calculate', () => {
    const range = [1, 2, 3, 4, 5];
    const expectedResult = {
      SUM: 15,
      AVERAGE: 3,
      COUNT: 5,
      MAX: 5,
      MIN: 1,
    };

    for (const formula in calculate) {
      it(`should return the ${formula} of numbers in the range`, () => {
        const result = calculate[formula](range);

        expect(result).toEqual(expectedResult[formula]);
      });
    }
  });

  describe('cellDataToGraph', () => {
    const data = {
      A1: {
        value: 2,
        formula: '=b1+c1',
      },
      B1: {
        value: 2,
        formula: '=c1+d1',
      },
      D1: {
        value: 2,
        formula: '=e1',
      },
      E1: {
        value: 2,
        formula: '=f1',
      },
      F1: {
        value: 2,
        formula: '=g1+h1',
      },
      G1: {
        value: 1,
        formula: '=i1',
      },
      H1: {
        value: 1,
        formula: '=i1',
      },
      I1: {
        value: '1',
        formula: '1',
      },
    };

    it('should return data in a sort-ready graph form', () => {
      const result = cellDataToGraph(data);

      expect(result).toEqual(graph);
    });
  });

  describe('sortGraph', () => {
    const expectedResult = [
      'C1',
      'I1',
      'G1',
      'H1',
      'F1',
      'E1',
      'D1',
      'B1',
      'A1',
    ];

    it('should sort graph in topological order', () => {
      const result = sortGraph(graph);

      expect(result).toEqual(expectedResult);
    });

    it('should detect cyclical graph', () => {
      const cyclical = { ...graph, I1: ['A1'] };
      const result = sortGraph(cyclical);

      expect(result).toEqual([]);
    });
  });
});
